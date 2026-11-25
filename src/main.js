import * as THREE from "three";
import APARTMENT_DATA from "./data/departamento.json";

// =========================================================================
// 2. PROCEDURAL CANVAS TEXTURES (zero external image files)
    // =========================================================================
    function makeWoodTexture(baseHex, grainHex) {
      const c = document.createElement("canvas");
      c.width = 256; c.height = 256;
      const ctx = c.getContext("2d");
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, 256, 256);
      const planks = 6;
      const ph = 256 / planks;
      for (let i = 0; i < planks; i++) {
        ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.03)";
        ctx.fillRect(0, i * ph, 256, ph);
        ctx.strokeStyle = grainHex;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, i * ph);
        ctx.lineTo(256, i * ph);
        ctx.stroke();
        const jointX = ((i * 83) % 200) + 28;
        ctx.beginPath();
        ctx.moveTo(jointX, i * ph);
        ctx.lineTo(jointX, (i + 1) * ph);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    function makeTileTexture(baseHex, groutHex, cells) {
      const c = document.createElement("canvas");
      c.width = 256; c.height = 256;
      const ctx = c.getContext("2d");
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, 256, 256);
      const step = 256 / cells;
      ctx.strokeStyle = groutHex;
      ctx.lineWidth = 2;
      for (let i = 0; i <= cells; i++) {
        ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, 256); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(256, i * step); ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    // =========================================================================
    // 3. THREE.JS SCENE SETUP
    // =========================================================================
    const viewport = document.getElementById("viewport");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6ebf2);

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.08, 120);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    viewport.appendChild(renderer.domElement);

    // Lighting (warm architectural daylight)
    const hemiLight = new THREE.HemisphereLight(0xf8fbff, 0xcbd5e1, 0.78);
    hemiLight.position.set(7.5, 12, 3.5);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 0.85);
    sunLight.position.set(14, 18, 16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 45;
    sunLight.shadow.camera.left = -14;
    sunLight.shadow.camera.right = 14;
    sunLight.shadow.camera.top = 14;
    sunLight.shadow.camera.bottom = -14;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.32);
    fillLight.position.set(-10, 9, -8);
    scene.add(fillLight);

    // Subtle ground plane outside
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xdbe2ec, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(7.5, -0.06, 3.5);
    ground.receiveShadow = true;
    scene.add(ground);

    // Scene Groups
    const structureGroup = new THREE.Group();
    const ceilingGroup = new THREE.Group();
    const furnitureGroup = new THREE.Group();
    scene.add(structureGroup, ceilingGroup, furnitureGroup);

    // Collision boxes for solid wall segments (in XZ plane)
    const wallColliders = [];

    // Shared Materials
    const matWall = new THREE.MeshStandardMaterial({ color: 0xf4f5f6, roughness: 0.88 });
    const matWallTop = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 });
    const matGlass = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.28, roughness: 0.15, metalness: 0.1 });
    const matFrame = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.55 });
    const matCeiling = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.92, side: THREE.DoubleSide });
    const matWoodDark = new THREE.MeshStandardMaterial({ color: 0x7c5c43, roughness: 0.65 });
    const matWoodLight = new THREE.MeshStandardMaterial({ color: 0xc8a986, roughness: 0.68 });
    const matWhiteGloss = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const matSofa = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
    const matBedSheet = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });
    const matBedBlanket = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.88 });
    const matBedBlanketAlt = new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.88 });
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.7 });
    const matGranite = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35 });
    const matScreen = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.3 });
    const matOutdoorFrame = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.4 });
    const matOutdoorCushion = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.88 });
    const matThrowBlue = new THREE.MeshStandardMaterial({ color: 0xcbdde9, roughness: 0.92 });
    const matLeafDark = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8 });
    const matLeafLight = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.78 });
    const matBark = new THREE.MeshStandardMaterial({ color: 0x6b4f3a, roughness: 0.9 });
    const matPlanter = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.75 });
    const matTerracotta = new THREE.MeshStandardMaterial({ color: 0xc28b6b, roughness: 0.72 });
    const matAccentBlue = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });

    const floorMaterials = {
      wood: (w, d) => {
        const t = makeWoodTexture("#d6be9e", "rgba(110, 78, 48, 0.22)");
        t.repeat.set(Math.max(1, w / 1.4), Math.max(1, d / 1.4));
        return new THREE.MeshStandardMaterial({ map: t, roughness: 0.72 });
      },
      porcelain: (w, d) => {
        const t = makeTileTexture("#e7e2d8", "rgba(148, 138, 124, 0.28)", 3);
        t.repeat.set(Math.max(1, w / 1.8), Math.max(1, d / 1.8));
        return new THREE.MeshStandardMaterial({ map: t, roughness: 0.45 });
      },
      tile: (w, d) => {
        const t = makeTileTexture("#dce3ea", "rgba(100, 116, 139, 0.28)", 4);
        t.repeat.set(Math.max(1, w / 1.2), Math.max(1, d / 1.2));
        return new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 });
      },
      tile_kitchen: (w, d) => {
        const t = makeTileTexture("#e2e8f0", "rgba(100, 116, 139, 0.25)", 3);
        t.repeat.set(Math.max(1, w / 1.4), Math.max(1, d / 1.4));
        return new THREE.MeshStandardMaterial({ map: t, roughness: 0.45 });
      },
      balcony: (w, d) => {
        const t = makeTileTexture("#cfd5dc", "rgba(100, 116, 139, 0.30)", 2);
        t.repeat.set(Math.max(1, w / 1.3), Math.max(1, d / 1.3));
        return new THREE.MeshStandardMaterial({ map: t, roughness: 0.55 });
      }
    };

    // =========================================================================
    // 4. BUILD STRUCTURE (FLOORS, CEILINGS, WALLS, GLASS RAILING)
    // =========================================================================
    function buildStructure() {
      const H = APARTMENT_DATA.meta.ceilingHeight;

      // Floors & Ceilings per room
      APARTMENT_DATA.rooms.forEach((r) => {
        const floorMat = floorMaterials[r.floor](r.w, r.d);
        const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(r.w, 0.08, r.d), floorMat);
        floorMesh.position.set(r.x + r.w / 2, -0.04, r.z + r.d / 2);
        floorMesh.receiveShadow = true;
        structureGroup.add(floorMesh);

        if (!r.isExterior) {
          const ceilMesh = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.d), matCeiling);
          ceilMesh.rotation.x = Math.PI / 2;
          ceilMesh.position.set(r.x + r.w / 2, H, r.z + r.d / 2);
          ceilingGroup.add(ceilMesh);
        }
      });

      // Balcony glass & aluminum railing (south, west, east)
      const railH = 1.05;
      const railPanels = [
        { x: 7.5, z: 9.03, w: 15.0, d: 0.04 }, // South
        { x: 0.02, z: 8.325, w: 0.04, d: 1.45 }, // West (bedrooms section)
        { x: 14.98, z: 8.00, w: 0.04, d: 2.10 } // East (living/kitchen section)
      ];
      railPanels.forEach((p) => {
        const glass = new THREE.Mesh(new THREE.BoxGeometry(p.w, railH - 0.08, p.d), matGlass);
        glass.position.set(p.x, railH / 2, p.z);
        structureGroup.add(glass);

        const handrail = new THREE.Mesh(
          new THREE.BoxGeometry(p.w > p.d ? p.w : 0.06, 0.05, p.d > p.w ? p.d : 0.06),
          matFrame
        );
        handrail.position.set(p.x, railH, p.z);
        structureGroup.add(handrail);

        wallColliders.push({
          minX: p.x - p.w / 2 - 0.12,
          maxX: p.x + p.w / 2 + 0.12,
          minZ: p.z - p.d / 2 - 0.12,
          maxZ: p.z + p.d / 2 + 0.12
        });
      });

      // Balcony vertical aluminum posts
      for (let x = 0; x <= 15.01; x += 2.5) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, railH, 0.05), matFrame);
        post.position.set(Math.min(14.98, Math.max(0.02, x)), railH / 2, 9.03);
        structureGroup.add(post);
      }

      // Helper to add a wall box with dark architectural top cap
      function addWallBox(cx, cz, len, thick, yBottom, yTop, isHoriz, isSolidCollider) {
        const h = yTop - yBottom;
        if (len <= 0.01 || h <= 0.01) return;
        const w = isHoriz ? len : thick;
        const d = isHoriz ? thick : len;
        const mats = [matWall, matWall, yTop >= H - 0.01 ? matWallTop : matWall, matWall, matWall, matWall];
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
        mesh.position.set(cx, yBottom + h / 2, cz);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        structureGroup.add(mesh);

        if (isSolidCollider) {
          wallColliders.push({
            minX: cx - w / 2,
            maxX: cx + w / 2,
            minZ: cz - d / 2,
            maxZ: cz + d / 2
          });
        }
      }

      // Build each wall with its openings
      APARTMENT_DATA.walls.forEach((wall) => {
        const dx = wall.x2 - wall.x1;
        const dz = wall.z2 - wall.z1;
        const isHoriz = Math.abs(dx) >= Math.abs(dz);
        const totalLen = Math.hypot(dx, dz);
        const dirX = dx / totalLen;
        const dirZ = dz / totalLen;
        const openings = (wall.openings || []).slice().sort((a, b) => a.from - b.from);

        let cursor = 0;
        openings.forEach((op) => {
          // Solid segment before opening
          if (op.from > cursor) {
            const segLen = op.from - cursor;
            const mid = cursor + segLen / 2;
            addWallBox(wall.x1 + dirX * mid, wall.z1 + dirZ * mid, segLen, wall.t, 0, H, isHoriz, true);
          }

          // Header above door/sliding window
          const opLen = op.to - op.from;
          const opMid = op.from + opLen / 2;
          const headY = op.head || 2.15;
          addWallBox(wall.x1 + dirX * opMid, wall.z1 + dirZ * opMid, opLen, wall.t, headY, H, isHoriz, false);

          // Visual aluminum frame for sliding glass doors (open pass-through so user can walk onto balcony)
          if (op.type === "sliding") {
            const frameW = isHoriz ? opLen : 0.04;
            const frameD = isHoriz ? 0.04 : opLen;
            const track = new THREE.Mesh(new THREE.BoxGeometry(frameW, 0.04, frameD), matFrame);
            track.position.set(wall.x1 + dirX * opMid, 0.02, wall.z1 + dirZ * opMid);
            structureGroup.add(track);

            // Half-open glass leaf on one side so balcony feels open & navigable
            const leafLen = opLen * 0.48;
            const leafMid = op.from + leafLen / 2;
            const leaf = new THREE.Mesh(
              new THREE.BoxGeometry(isHoriz ? leafLen : 0.025, headY - 0.04, isHoriz ? 0.025 : leafLen),
              matGlass
            );
            leaf.position.set(wall.x1 + dirX * leafMid, headY / 2, wall.z1 + dirZ * leafMid);
            structureGroup.add(leaf);
          } else if (op.type === "door") {
            // Subtle door jamb markers
            const jamb1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, headY, 0.04), matWoodLight);
            jamb1.position.set(wall.x1 + dirX * op.from, headY / 2, wall.z1 + dirZ * op.from);
            const jamb2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, headY, 0.04), matWoodLight);
            jamb2.position.set(wall.x1 + dirX * op.to, headY / 2, wall.z1 + dirZ * op.to);
            structureGroup.add(jamb1, jamb2);
          }

          cursor = op.to;
        });

        // Remaining solid segment after last opening
        if (totalLen > cursor) {
          const segLen = totalLen - cursor;
          const mid = cursor + segLen / 2;
          addWallBox(wall.x1 + dirX * mid, wall.z1 + dirZ * mid, segLen, wall.t, 0, H, isHoriz, true);
        }
      });
    }

    // =========================================================================
    // 5. PROCEDURAL FURNITURE BUILDER (no Blender/Maya needed)
    // =========================================================================
    function addBox(parent, w, h, d, x, y, z, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }

    function buildFurniture() {
      APARTMENT_DATA.furniture.forEach((item) => {
        const g = new THREE.Group();
        g.position.set(item.x, 0, item.z);
        if (item.rot) g.rotation.y = item.rot;

        switch (item.type) {
          case "wardrobe": {
            addBox(g, item.w, item.h, item.d, 0, item.h / 2, 0, matWhiteGloss);
            // Subtle door groove line
            const groove = new THREE.Mesh(
              new THREE.BoxGeometry(item.w > item.d ? 0.015 : item.w + 0.01, item.h - 0.1, item.d > item.w ? 0.015 : item.d + 0.01),
              matFrame
            );
            groove.position.set(0, item.h / 2, 0);
            g.add(groove);
            break;
          }
          case "double_bed": {
            // Frame 1.65 x 2.00
            addBox(g, 1.68, 0.28, 2.04, 0, 0.14, 0, matWoodDark);
            addBox(g, 1.60, 0.24, 1.95, 0, 0.38, 0.02, matBedSheet);
            addBox(g, 1.62, 0.16, 1.25, 0, 0.44, 0.36, matBedBlanket);
            addBox(g, 1.72, 1.05, 0.1, 0, 0.525, -0.98, matWoodDark); // headboard
            addBox(g, 0.62, 0.14, 0.38, -0.4, 0.56, -0.68, matWhiteGloss);
            addBox(g, 0.62, 0.14, 0.38, 0.4, 0.56, -0.68, matWhiteGloss);
            break;
          }
          case "single_bed": {
            // Frame 0.98 x 1.98
            addBox(g, 1.0, 0.26, 2.0, 0, 0.13, 0, matWoodLight);
            addBox(g, 0.94, 0.22, 1.92, 0, 0.36, 0.02, matBedSheet);
            addBox(g, 0.96, 0.14, 1.25, 0, 0.42, 0.34, matBedBlanketAlt);
            addBox(g, 1.02, 0.92, 0.08, 0, 0.46, -0.96, matWoodLight);
            addBox(g, 0.6, 0.13, 0.36, 0, 0.53, -0.66, matWhiteGloss);
            break;
          }
          case "nightstand": {
            addBox(g, 0.46, 0.48, 0.42, 0, 0.24, 0, matWoodDark);
            addBox(g, 0.12, 0.22, 0.12, 0, 0.59, 0, matWhiteGloss); // lamp
            break;
          }
          case "desk_setup": {
            // Wide Desk (1.78 wide x 0.74 deep x 0.75 high) for triple-monitor setup
            addBox(g, 1.78, 0.05, 0.74, 0, 0.74, 0, matWoodLight);
            addBox(g, 0.05, 0.72, 0.68, -0.84, 0.36, 0, matFrame);
            addBox(g, 0.05, 0.72, 0.68, 0.84, 0.36, 0, matFrame);
            // Center monitor + stand
            addBox(g, 0.54, 0.33, 0.03, 0, 1.04, -0.20, matScreen);
            addBox(g, 0.07, 0.18, 0.07, 0, 0.84, -0.20, matFrame);
            // Left angled monitor
            const monL = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.33, 0.03), matScreen);
            monL.position.set(-0.54, 1.04, -0.12);
            monL.rotation.y = 0.32;
            monL.castShadow = true;
            g.add(monL);
            addBox(g, 0.06, 0.18, 0.06, -0.54, 0.84, -0.14, matFrame);
            // Right angled monitor
            const monR = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.33, 0.03), matScreen);
            monR.position.set(0.54, 1.04, -0.12);
            monR.rotation.y = -0.32;
            monR.castShadow = true;
            g.add(monR);
            addBox(g, 0.06, 0.18, 0.06, 0.54, 0.84, -0.14, matFrame);
            // Keyboard + mouse
            addBox(g, 0.44, 0.02, 0.15, -0.05, 0.77, 0.14, matFrame);
            addBox(g, 0.07, 0.02, 0.11, 0.28, 0.77, 0.14, matFrame);
            // Ergonomic Office Chair in front of desk (+Z)
            addBox(g, 0.52, 0.08, 0.5, 0, 0.46, 0.60, matSofa);
            addBox(g, 0.48, 0.58, 0.08, 0, 0.77, 0.82, matSofa);
            addBox(g, 0.07, 0.42, 0.07, 0, 0.21, 0.60, matFrame);
            addBox(g, 0.46, 0.04, 0.46, 0, 0.04, 0.60, matFrame);
            break;
          }
          case "small_desk": {
            // Compact study desk (1.10 wide x 0.56 deep) for Dormitorio Nico
            addBox(g, 1.10, 0.045, 0.56, 0, 0.74, 0, matWoodLight);
            addBox(g, 0.045, 0.72, 0.50, -0.50, 0.36, 0, matFrame);
            addBox(g, 0.045, 0.72, 0.50, 0.50, 0.36, 0, matFrame);
            // Laptop
            addBox(g, 0.34, 0.018, 0.24, 0, 0.77, -0.02, matFrame);
            const screen = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.015), matScreen);
            screen.position.set(0, 0.88, -0.14);
            screen.rotation.x = -0.18;
            g.add(screen);
            // Compact chair
            addBox(g, 0.44, 0.06, 0.44, 0, 0.45, 0.50, matSofa);
            addBox(g, 0.42, 0.44, 0.06, 0, 0.69, 0.69, matSofa);
            addBox(g, 0.06, 0.42, 0.06, 0, 0.21, 0.50, matFrame);
            addBox(g, 0.38, 0.035, 0.38, 0, 0.035, 0.50, matFrame);
            break;
          }
          case "dresser": {
            // Cómoda sin TV para Dormitorio Principal
            const dh = item.h || 0.82;
            addBox(g, item.w, dh, item.d, 0, dh / 2, 0, matWoodDark);
            // Subtle drawer lines on the front (-X face facing the bed)
            addBox(g, 0.015, 0.012, item.d - 0.08, -item.w / 2 - 0.005, dh * 0.33, 0, matWoodLight);
            addBox(g, 0.015, 0.012, item.d - 0.08, -item.w / 2 - 0.005, dh * 0.66, 0, matWoodLight);
            break;
          }
          case "bookshelf": {
            const bw = item.w || 0.34;
            const bd = item.d || 1.15;
            const bh = item.h || 1.75;
            // Back panel (+X side against east wall) and side panels
            addBox(g, 0.025, bh, bd, bw / 2 - 0.015, bh / 2, 0, matWoodLight);
            addBox(g, bw, bh, 0.03, 0, bh / 2, -bd / 2 + 0.015, matWoodLight);
            addBox(g, bw, bh, 0.03, 0, bh / 2, bd / 2 - 0.015, matWoodLight);
            // Horizontal shelves (bottom, 4 inner shelves, top)
            const shelves = 5;
            for (let i = 0; i <= shelves; i++) {
              const sy = i === 0 ? 0.04 : (i === shelves ? bh - 0.015 : (bh / shelves) * i);
              addBox(g, bw - 0.02, 0.03, bd - 0.04, -0.01, sy, 0, matWoodLight);
            }
            // Decorative book clusters on inner shelves
            const bookMats = [matBedBlanket, matTerracotta, matSofa, matBedBlanketAlt, matWoodDark];
            for (let s = 1; s < shelves; s++) {
              const baseY = (bh / shelves) * s + 0.015;
              const startZ = -bd / 2 + 0.14 + (s % 2) * 0.08;
              for (let b = 0; b < 5; b++) {
                const bhBook = 0.17 + ((s * 3 + b) % 4) * 0.025;
                addBox(g, bw * 0.58, bhBook, 0.055, 0.02, baseY + bhBook / 2, startZ + b * 0.15, bookMats[(s + b) % bookMats.length]);
              }
            }
            break;
          }
          case "sofa": {
            addBox(g, 2.25, 0.36, 0.88, 0, 0.18, 0, matSofa);
            addBox(g, 2.25, 0.48, 0.22, 0, 0.54, -0.33, matSofa);
            addBox(g, 0.22, 0.32, 0.88, -1.01, 0.48, 0, matSofa);
            addBox(g, 0.22, 0.32, 0.88, 1.01, 0.48, 0, matSofa);
            break;
          }
          case "armchair": {
            addBox(g, 0.78, 0.34, 0.76, 0, 0.17, 0, matSofa);
            addBox(g, 0.78, 0.44, 0.18, 0, 0.52, -0.29, matSofa);
            addBox(g, 0.14, 0.26, 0.76, -0.32, 0.44, 0, matSofa);
            addBox(g, 0.14, 0.26, 0.76, 0.32, 0.44, 0, matSofa);
            break;
          }
          case "coffee_table": {
            // Rug
            const rug = new THREE.Mesh(
              new THREE.BoxGeometry(2.3, 0.015, 2.7),
              new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.95 })
            );
            rug.position.set(0.15, 0.008, 0.1);
            rug.receiveShadow = true;
            g.add(rug);
            // Layered coffee tables like in the plan
            addBox(g, 0.82, 0.36, 0.82, -0.18, 0.18, -0.15, matWoodLight);
            addBox(g, 0.78, 0.30, 0.78, 0.18, 0.15, 0.18, matWhiteGloss);
            break;
          }
          case "tv_console": {
            addBox(g, item.w, 0.48, item.d, 0, 0.24, 0, matWoodDark);
            addBox(g, 0.05, 0.72, 1.25, -0.05, 1.15, 0, matScreen);
            break;
          }
          case "pouf": {
            addBox(g, 0.46, 0.38, 0.46, 0, 0.19, 0, matWoodLight);
            break;
          }
          case "dining_set": {
            // Rectangular 6-chair dining table (1.85 m along X parallel to balcony x 0.95 m deep)
            addBox(g, 1.85, 0.06, 0.95, 0, 0.74, 0, matWoodDark);
            addBox(g, 0.10, 0.72, 0.10, -0.78, 0.36, -0.36, matWoodDark);
            addBox(g, 0.10, 0.72, 0.10, 0.78, 0.36, -0.36, matWoodDark);
            addBox(g, 0.10, 0.72, 0.10, -0.78, 0.36, 0.36, matWoodDark);
            addBox(g, 0.10, 0.72, 0.10, 0.78, 0.36, 0.36, matWoodDark);
            const chairOffsets = [
              [-0.45, -0.68, 0], [0.45, -0.68, 0],
              [-0.45, 0.68, Math.PI], [0.45, 0.68, Math.PI],
              [-1.12, 0, Math.PI / 2],
              [1.12, 0, -Math.PI / 2]
            ];
            chairOffsets.forEach(([cx, cz, ry]) => {
              const cg = new THREE.Group();
              cg.position.set(cx, 0, cz);
              cg.rotation.y = ry;
              addBox(cg, 0.44, 0.06, 0.44, 0, 0.45, 0, matWoodLight);
              addBox(cg, 0.44, 0.42, 0.06, 0, 0.68, -0.19, matWoodLight);
              addBox(cg, 0.05, 0.44, 0.05, -0.18, 0.22, -0.18, matFrame);
              addBox(cg, 0.05, 0.44, 0.05, 0.18, 0.22, -0.18, matFrame);
              addBox(cg, 0.05, 0.44, 0.05, -0.18, 0.22, 0.18, matFrame);
              addBox(cg, 0.05, 0.44, 0.05, 0.18, 0.22, 0.18, matFrame);
              g.add(cg);
            });
            break;
          }
          case "breakfast_set": {
            addBox(g, 1.15, 0.05, 0.75, 0, 0.74, 0, matWhiteGloss);
            addBox(g, 0.07, 0.72, 0.07, -0.5, 0.36, -0.3, matFrame);
            addBox(g, 0.07, 0.72, 0.07, 0.5, 0.36, -0.3, matFrame);
            addBox(g, 0.07, 0.72, 0.07, -0.5, 0.36, 0.3, matFrame);
            addBox(g, 0.07, 0.72, 0.07, 0.5, 0.36, 0.3, matFrame);
            [[-0.28, -0.52], [0.28, -0.52], [-0.28, 0.52], [0.28, 0.52]].forEach(([cx, cz]) => {
              addBox(g, 0.4, 0.44, 0.4, cx, 0.22, cz, matWoodLight);
            });
            break;
          }
          case "kitchen_counter": {
            addBox(g, item.w, 0.86, item.d, 0, 0.43, 0, matWhiteGloss);
            addBox(g, item.w + 0.02, 0.04, item.d + 0.02, 0, 0.88, 0, matGranite);
            if (item.hasSink) {
              addBox(g, 0.4, 0.02, 0.72, 0, 0.905, 0, matMetal);
            }
            break;
          }
          case "fridge": {
            addBox(g, 0.68, 1.85, 0.68, 0, 0.925, 0, matMetal);
            break;
          }
          case "stove": {
            addBox(g, 0.62, 0.88, 0.64, 0, 0.44, 0, matMetal);
            addBox(g, 0.56, 0.03, 0.56, 0, 0.895, 0, matScreen);
            break;
          }
          case "laundry": {
            addBox(g, item.w, 0.85, item.d, 0, 0.425, 0, matWhiteGloss);
            addBox(g, 0.55, 0.55, 0.04, 0.3, 0.45, item.d / 2 + 0.01, matFrame); // washer door
            break;
          }
          case "bathtub": {
            addBox(g, item.w, 0.52, item.d, 0, 0.26, 0, matWhiteGloss);
            addBox(g, item.w - 0.14, 0.06, item.d - 0.16, 0, 0.51, 0, matGlass);
            break;
          }
          case "vanity": {
            addBox(g, item.w, 0.82, item.d, 0, 0.41, 0, matWoodLight);
            addBox(g, item.w + 0.02, 0.04, item.d + 0.02, 0, 0.84, 0, matWhiteGloss);
            break;
          }
          case "toilet": {
            addBox(g, 0.38, 0.42, 0.54, 0, 0.21, 0.05, matWhiteGloss);
            if (!item.isBidet) {
              addBox(g, 0.38, 0.44, 0.16, 0, 0.62, -0.16, matWhiteGloss);
            }
            break;
          }
          case "balcony_lounge": {
            // Helper for charcoal metal outdoor chair/loveseat with cushions & draped pale blue-gray throw
            const addOutdoorSeat = (cx, cz, depthX, widthZ, faceDir) => {
              const sg = new THREE.Group();
              sg.position.set(cx, 0, cz);
              const backX = -faceDir * (depthX / 2 - 0.04);
              // 4 legs
              [[-depthX / 2 + 0.04, -widthZ / 2 + 0.04], [-depthX / 2 + 0.04, widthZ / 2 - 0.04],
               [depthX / 2 - 0.04, -widthZ / 2 + 0.04], [depthX / 2 - 0.04, widthZ / 2 - 0.04]].forEach(([lx, lz]) => {
                addBox(sg, 0.045, 0.52, 0.045, lx, 0.26, lz, matOutdoorFrame);
              });
              // Side armrests & seat frame
              addBox(sg, depthX, 0.045, 0.05, 0, 0.52, -widthZ / 2 + 0.04, matOutdoorFrame);
              addBox(sg, depthX, 0.045, 0.05, 0, 0.52, widthZ / 2 - 0.04, matOutdoorFrame);
              addBox(sg, depthX - 0.06, 0.05, widthZ - 0.08, 0, 0.30, 0, matOutdoorFrame);
              // Backrest frame
              addBox(sg, 0.045, 0.46, widthZ - 0.06, backX, 0.52, 0, matOutdoorFrame);
              // Seat & back cushions
              addBox(sg, depthX - 0.10, 0.10, widthZ - 0.12, faceDir * 0.02, 0.37, 0, matOutdoorCushion);
              addBox(sg, 0.11, 0.36, widthZ - 0.14, backX + faceDir * 0.08, 0.56, 0, matOutdoorCushion);
              // Draped pale blue-gray throw blanket
              addBox(sg, 0.14, 0.34, widthZ - 0.16, backX + faceDir * 0.06, 0.60, 0, matThrowBlue);
              addBox(sg, depthX - 0.16, 0.04, widthZ - 0.18, faceDir * 0.06, 0.43, 0, matThrowBlue);
              g.add(sg);
            };

            // 2 individual armchairs on west side facing east (+X)
            addOutdoorSeat(-0.92, -0.35, 0.64, 0.60, 1);
            addOutdoorSeat(-0.92, 0.35, 0.64, 0.60, 1);

            // 2-seater loveseat on east side facing west (-X)
            addOutdoorSeat(0.92, 0, 0.66, 1.24, -1);

            // Center dark slatted coffee table
            addBox(g, 0.54, 0.04, 0.94, 0, 0.38, 0, matOutdoorFrame);
            [[-0.23, -0.42], [0.23, -0.42], [-0.23, 0.42], [0.23, 0.42]].forEach(([lx, lz]) => {
              addBox(g, 0.04, 0.37, 0.04, lx, 0.185, lz, matOutdoorFrame);
            });

            // Small white ceramic pot with green herb plant on coffee table
            const smallPot = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.14, 14), matWhiteGloss);
            smallPot.position.set(-0.08, 0.47, -0.26);
            smallPot.castShadow = true;
            g.add(smallPot);
            const herb1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), matLeafLight);
            herb1.position.set(-0.08, 0.60, -0.26);
            herb1.scale.set(0.9, 1.25, 0.9);
            herb1.castShadow = true;
            g.add(herb1);
            const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.025, 12), matFrame);
            dish.position.set(-0.08, 0.415, -0.04);
            g.add(dish);
            break;
          }
          case "potted_plant": {
            const s = item.scale || 1;
            const pg = new THREE.Group();
            pg.scale.set(s, s, s);
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.16, 0.36, 14), matPlanter);
            pot.position.set(0, 0.18, 0);
            pot.castShadow = true;
            pot.receiveShadow = true;
            pg.add(pot);
            const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 12), matBark);
            soil.position.set(0, 0.35, 0);
            pg.add(soil);
            // Branching woody stems
            [
              [0, 0.78, 0, 0.08, 0.05, 0.95],
              [-0.06, 0.74, 0.05, -0.18, 0.20, 0.85],
              [0.06, 0.76, -0.04, 0.16, -0.18, 0.88]
            ].forEach(([sx, sy, sz, rx, rz, h]) => {
              const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, h, 7), matBark);
              stem.position.set(sx, sy, sz);
              stem.rotation.set(rx, 0, rz);
              stem.castShadow = true;
              pg.add(stem);
            });
            // Organic multi-tone foliage clusters
            [
              [0, 1.48, 0, 0.24, matLeafDark],
              [-0.16, 1.28, 0.12, 0.21, matLeafLight],
              [0.18, 1.32, -0.10, 0.22, matLeafDark],
              [0.14, 1.12, 0.16, 0.20, matLeafLight],
              [-0.18, 1.05, -0.12, 0.19, matLeafDark],
              [0.02, 0.96, 0.14, 0.18, matLeafLight],
              [-0.08, 1.44, -0.14, 0.18, matLeafLight],
              [0.10, 1.58, 0.06, 0.16, matLeafDark],
              [-0.05, 0.82, -0.04, 0.17, matLeafDark]
            ].forEach(([fx, fy, fz, rad, mat]) => {
              const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 0), mat);
              leaf.position.set(fx, fy, fz);
              leaf.castShadow = true;
              pg.add(leaf);
            });
            g.add(pg);
            break;
          }
          case "bistro_set": {
            // Round terracotta-mosaic bistro table
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.355, 0.355, 0.025, 22), matOutdoorFrame);
            rim.position.set(0, 0.71, 0);
            rim.castShadow = true;
            g.add(rim);
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.032, 22), matTerracotta);
            top.position.set(0, 0.72, 0);
            top.castShadow = true;
            top.receiveShadow = true;
            g.add(top);
            // Curved-feel tripod wrought-iron base + center ring
            const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 16), matOutdoorFrame);
            ring.position.set(0, 0.35, 0);
            g.add(ring);
            for (let i = 0; i < 3; i++) {
              const ang = (i * Math.PI * 2) / 3 + 0.4;
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.74, 6), matOutdoorFrame);
              leg.position.set(Math.cos(ang) * 0.17, 0.36, Math.sin(ang) * 0.17);
              leg.rotation.z = Math.cos(ang) * 0.22;
              leg.rotation.x = -Math.sin(ang) * 0.22;
              leg.castShadow = true;
              g.add(leg);
            }
            // Small black decorative lantern on tabletop
            const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.13, 12), matOutdoorFrame);
            lantern.position.set(0.10, 0.80, -0.06);
            lantern.castShadow = true;
            g.add(lantern);

            // 2 wrought-iron café chairs facing each other along X
            [[-0.50, -0.05, 0.18], [0.50, 0.05, Math.PI + 0.18]].forEach(([cx, cz, ry]) => {
              const cg = new THREE.Group();
              cg.position.set(cx, 0, cz);
              cg.rotation.y = ry;
              const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.025, 16), matOutdoorFrame);
              seat.position.set(0, 0.44, 0);
              seat.castShadow = true;
              cg.add(seat);
              const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.032, 16), matOutdoorCushion);
              cushion.position.set(0, 0.465, 0);
              cg.add(cushion);
              [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].forEach(([lx, lz]) => {
                const cleg = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.44, 6), matOutdoorFrame);
                cleg.position.set(lx, 0.22, lz);
                cleg.castShadow = true;
                cg.add(cleg);
              });
              // Backrest posts + circular mosaic medallion
              addBox(cg, 0.02, 0.44, 0.02, -0.18, 0.66, -0.14, matOutdoorFrame);
              addBox(cg, 0.02, 0.44, 0.02, -0.18, 0.66, 0.14, matOutdoorFrame);
              addBox(cg, 0.02, 0.025, 0.30, -0.18, 0.88, 0, matOutdoorFrame);
              const med = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.02, 14), matTerracotta);
              med.rotation.z = Math.PI / 2;
              med.position.set(-0.18, 0.72, 0);
              med.castShadow = true;
              cg.add(med);
              g.add(cg);
            });
            break;
          }
          case "ac_unit": {
            // Outdoor Daikin AC condenser unit at far west end of balcony
            addBox(g, 0.34, 0.68, 0.84, 0, 0.40, 0, matWhiteGloss);
            addBox(g, 0.36, 0.06, 0.08, 0, 0.03, -0.30, matPlanter);
            addBox(g, 0.36, 0.06, 0.08, 0, 0.03, 0.30, matPlanter);
            const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 20), matFrame);
            fan.rotation.z = Math.PI / 2;
            fan.position.set(0.175, 0.40, 0.10);
            g.add(fan);
            addBox(g, 0.01, 0.09, 0.10, 0.175, 0.61, -0.26, matAccentBlue);
            break;
          }
        }

        furnitureGroup.add(g);
      });
    }

    buildStructure();
    buildFurniture();

    // =========================================================================
    // 6. CAMERA, NAVIGATION & COLLISION ENGINE (Orbit + First-Person)
    // =========================================================================
    const state = {
      mode: "orbit", // 'orbit' | 'fly' | 'fps'
      panTool: false, // false = left-drag rotates, true = left-drag pans freely
      showCeiling: false,
      showFurniture: true,
      showLabels: true,
      // Orbit state
      orbitTarget: new THREE.Vector3(7.5, 0.5, 3.8),
      orbitRadius: 16.5,
      orbitTheta: 0.42, // radians around Y
      orbitPhi: 0.82,   // polar angle from Y+
      // Free-Fly state (no fixed pivot!)
      flyPos: new THREE.Vector3(12.2, 8.2, 13.5),
      flyYaw: 0.32,
      flyPitch: -0.58,
      // FPS state
      fpsPos: new THREE.Vector3(10.6, 1.65, 2.7),
      fpsYaw: Math.PI, // looking toward +Z (living / balcony)
      fpsPitch: -0.04,
      // Input
      isDragging: false,
      dragButton: 0,
      lastX: 0,
      lastY: 0,
      keys: {}
    };

    ceilingGroup.visible = state.showCeiling;
    furnitureGroup.visible = state.showFurniture;

    function updateCameraFromState() {
      if (state.mode === "orbit") {
        const sinPhi = Math.sin(state.orbitPhi);
        camera.position.set(
          state.orbitTarget.x + state.orbitRadius * sinPhi * Math.sin(state.orbitTheta),
          state.orbitTarget.y + state.orbitRadius * Math.cos(state.orbitPhi),
          state.orbitTarget.z + state.orbitRadius * sinPhi * Math.cos(state.orbitTheta)
        );
        camera.lookAt(state.orbitTarget);
      } else if (state.mode === "fly") {
        camera.position.copy(state.flyPos);
        const euler = new THREE.Euler(state.flyPitch, state.flyYaw, 0, "YXZ");
        camera.quaternion.setFromEuler(euler);
      } else {
        camera.position.copy(state.fpsPos);
        const euler = new THREE.Euler(state.fpsPitch, state.fpsYaw, 0, "YXZ");
        camera.quaternion.setFromEuler(euler);
      }
    }

    function collides(x, z) {
      const r = 0.24;
      // Apartment outer bounding limit
      if (x < 0.18 || x > 14.82 || z < -1.52 || z > 8.85) return true;
      for (let i = 0; i < wallColliders.length; i++) {
        const b = wallColliders[i];
        if (x + r > b.minX && x - r < b.maxX && z + r > b.minZ && z - r < b.maxZ) {
          return true;
        }
      }
      return false;
    }

    function detectCurrentRoom(x, z) {
      for (let i = 0; i < APARTMENT_DATA.rooms.length; i++) {
        const r = APARTMENT_DATA.rooms[i];
        if (x >= r.x && x <= r.x + r.w && z >= r.z && z <= r.z + r.d) {
          return r.name;
        }
      }
      return "Exterior";
    }

    // =========================================================================
    // 7. UI CONTROLS, ROOM TELEPORT & MODE SWITCHING
    // =========================================================================
    const btnOrbit = document.getElementById("btn-mode-orbit");
    const btnFly = document.getElementById("btn-mode-fly");
    const btnFps = document.getElementById("btn-mode-fps");
    const btnPanTool = document.getElementById("btn-pan-tool");
    const btnCeiling = document.getElementById("btn-toggle-ceiling");
    const btnFurniture = document.getElementById("btn-toggle-furniture");
    const btnLabels = document.getElementById("btn-toggle-labels");
    const controlsHint = document.getElementById("controls-hint");
    const currentRoomBadge = document.getElementById("current-room-badge");
    const coordsReadout = document.getElementById("coords-readout");
    const fpsDpad = document.getElementById("fps-dpad");
    const toastEl = document.getElementById("toast");

    let toastTimer = null;
    function showToast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.remove("opacity-0");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.add("opacity-0"), 2200);
    }

    function setMode(newMode) {
      // Smooth handoff when switching into Vuelo Libre from current camera position
      if (newMode === "fly" && state.mode !== "fly") {
        state.flyPos.copy(camera.position);
        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
        state.flyYaw = euler.y;
        state.flyPitch = euler.x;
      }

      state.mode = newMode;
      const isOrbit = newMode === "orbit";
      const isFly = newMode === "fly";
      const isFps = newMode === "fps";

      const activeCls = "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-blue-600 text-white whitespace-nowrap";
      const idleCls = "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-slate-200 hover:bg-white/10 whitespace-nowrap";
      btnOrbit.className = isOrbit ? activeCls : idleCls;
      btnFly.className = isFly ? activeCls : idleCls;
      btnFps.className = isFps ? activeCls : idleCls;

      btnPanTool.classList.toggle("hidden", !isOrbit);
      viewport.classList.toggle("fps-mode", isFps || isFly);
      fpsDpad.classList.toggle("hidden", !(isFps || isFly));

      // Auto-toggle ceiling for best visibility in each mode
      state.showCeiling = isFps;
      ceilingGroup.visible = state.showCeiling;
      syncToggleButtons();

      if (isFps) {
        controlsHint.innerHTML = 'Flechas / <span class="font-mono text-white">WASD</span> para caminar · Arrastrá el mouse para mirar 360° · <span class="font-mono text-white">M</span> cambia de modo.';
      } else if (isFly) {
        controlsHint.innerHTML = 'Sin pivote fijo: Flechas / <span class="font-mono text-white">WASD</span> vuelan en la dirección que mirás · <span class="font-mono text-white">Q/E</span> sube y baja · Arrastrá para mirar · Rueda avanza.';
      } else {
        controlsHint.innerHTML = state.panTool
          ? 'Modo Mano activo: arrastrá para mover el plano libremente · Clic derecho rota · Flechas desplazan · Rueda hace zoom.'
          : 'Arrastrá para rotar · Clic derecho o <span class="font-mono text-white">Mano</span> mueve el plano libre · Flechas desplazan · <span class="font-mono text-white">Vuelo Libre</span> quita el pivote.';
      }

      updateCameraFromState();
    }

    function syncToggleButtons() {
      btnCeiling.textContent = state.showCeiling ? "Techo: On" : "Techo: Off";
      btnCeiling.classList.toggle("bg-white/15", state.showCeiling);
      btnFurniture.textContent = state.showFurniture ? "Muebles: On" : "Muebles: Off";
      btnFurniture.classList.toggle("bg-white/15", state.showFurniture);
      btnLabels.textContent = state.showLabels ? "Etiquetas: On" : "Etiquetas: Off";
      btnLabels.classList.toggle("bg-white/15", state.showLabels);
      document.getElementById("labels-layer").style.display = state.showLabels ? "block" : "none";
    }

    btnOrbit.addEventListener("click", () => setMode("orbit"));
    btnFly.addEventListener("click", () => setMode("fly"));
    btnFps.addEventListener("click", () => setMode("fps"));
    btnPanTool.addEventListener("click", () => {
      state.panTool = !state.panTool;
      btnPanTool.textContent = state.panTool ? "Mano: Mover" : "Mano: Rotar";
      btnPanTool.classList.toggle("bg-amber-500/30", state.panTool);
      setMode("orbit");
    });

    btnCeiling.addEventListener("click", () => {
      state.showCeiling = !state.showCeiling;
      ceilingGroup.visible = state.showCeiling;
      syncToggleButtons();
    });

    btnFurniture.addEventListener("click", () => {
      state.showFurniture = !state.showFurniture;
      furnitureGroup.visible = state.showFurniture;
      syncToggleButtons();
    });

    btnLabels.addEventListener("click", () => {
      state.showLabels = !state.showLabels;
      syncToggleButtons();
    });

    // Quick Room Teleport Pills
    const roomPillsContainer = document.getElementById("room-pills");
    const overviewBtn = document.createElement("button");
    overviewBtn.type = "button";
    overviewBtn.textContent = "Vista General";
    overviewBtn.className = "glass-panel text-white hover:bg-blue-600/80 px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors whitespace-nowrap shadow";
    overviewBtn.addEventListener("click", () => {
      state.orbitTarget.set(7.5, 0.5, 3.8);
      state.orbitRadius = 16.5;
      state.orbitTheta = 0.42;
      state.orbitPhi = 0.82;
      setMode("orbit");
    });
    roomPillsContainer.appendChild(overviewBtn);

    function teleportToRoom(room) {
      if (!room.spawn) return;
      state.fpsPos.set(room.spawn[0], 1.65, room.spawn[1]);
      if (room.lookAt) {
        const dx = room.lookAt[0] - room.spawn[0];
        const dz = room.lookAt[1] - room.spawn[1];
        state.fpsYaw = Math.atan2(-dx, -dz);
        state.fpsPitch = -0.05;
      }
      setMode("fps");
      showToast("Ubicado en: " + room.name);
    }

    APARTMENT_DATA.rooms.filter((r) => r.quick).forEach((room) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = room.shortName || room.name;
      btn.className = room.customMod
        ? "glass-panel text-sky-200 border-sky-400/50 hover:bg-sky-600/80 hover:text-white px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors whitespace-nowrap shadow"
        : "glass-panel text-slate-100 hover:bg-blue-600/80 px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors whitespace-nowrap shadow";
      btn.addEventListener("click", () => teleportToRoom(room));
      roomPillsContainer.appendChild(btn);
    });

    // JSON Modal
    const jsonModal = document.getElementById("json-modal");
    const jsonContent = document.getElementById("json-content");
    document.getElementById("btn-open-json").addEventListener("click", () => {
      jsonContent.textContent = JSON.stringify(APARTMENT_DATA, null, 2);
      jsonModal.classList.remove("hidden");
      jsonModal.classList.add("flex");
    });
    document.getElementById("btn-close-json").addEventListener("click", () => {
      jsonModal.classList.add("hidden");
      jsonModal.classList.remove("flex");
    });
    document.getElementById("btn-copy-json").addEventListener("click", () => {
      const text = JSON.stringify(APARTMENT_DATA, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showToast("JSON copiado al portapapeles")).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    });
    function fallbackCopy(text) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); showToast("JSON copiado al portapapeles"); } catch (e) {}
      document.body.removeChild(ta);
    }

    // =========================================================================
    // 8. MOUSE, TOUCH & KEYBOARD HANDLERS
    // =========================================================================
    viewport.addEventListener("pointerdown", (e) => {
      state.isDragging = true;
      state.dragButton = e.button;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      viewport.classList.add("dragging");
      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.lastX;
      const dy = e.clientY - state.lastY;
      state.lastX = e.clientX;
      state.lastY = e.clientY;

      if (state.mode === "orbit") {
        const shouldPan = state.panTool
          ? (state.dragButton === 0 && !e.shiftKey) || state.dragButton === 1
          : (state.dragButton === 2 || state.dragButton === 1 || e.shiftKey);
        if (shouldPan) {
          // Free pan across the floor plane relative to camera view
          const panSpeed = state.orbitRadius * 0.0015;
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.y = 0;
          if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
          forward.normalize();
          const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
          state.orbitTarget.addScaledVector(right, -dx * panSpeed);
          state.orbitTarget.addScaledVector(forward, dy * panSpeed);
        } else {
          // Rotate
          state.orbitTheta -= dx * 0.0065;
          state.orbitPhi = Math.max(0.12, Math.min(1.48, state.orbitPhi - dy * 0.0065));
        }
      } else if (state.mode === "fly") {
        if (state.dragButton === 2 || state.dragButton === 1 || e.shiftKey) {
          // Free 3D pan in fly mode
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
          const up = new THREE.Vector3().crossVectors(right, forward).normalize();
          state.flyPos.addScaledVector(right, -dx * 0.018);
          state.flyPos.addScaledVector(up, dy * 0.018);
        } else {
          // Free 360 look in fly mode
          state.flyYaw -= dx * 0.0042;
          state.flyPitch = Math.max(-1.45, Math.min(1.45, state.flyPitch - dy * 0.0042));
        }
      } else {
        // First-person look around
        state.fpsYaw -= dx * 0.0042;
        state.fpsPitch = Math.max(-1.1, Math.min(1.1, state.fpsPitch - dy * 0.0042));
      }
    });

    viewport.addEventListener("pointerup", () => {
      state.isDragging = false;
      viewport.classList.remove("dragging");
    });

    viewport.addEventListener("contextmenu", (e) => e.preventDefault());

    viewport.addEventListener("wheel", (e) => {
      if (state.mode === "orbit") {
        e.preventDefault();
        state.orbitRadius = Math.max(3.5, Math.min(36.0, state.orbitRadius + e.deltaY * 0.012));
      } else if (state.mode === "fly") {
        e.preventDefault();
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        state.flyPos.addScaledVector(dir, -e.deltaY * 0.012);
        state.flyPos.y = Math.max(0.4, Math.min(28, state.flyPos.y));
      }
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
      if (!jsonModal.classList.contains("hidden")) {
        if (e.key === "Escape") {
          jsonModal.classList.add("hidden");
          jsonModal.classList.remove("flex");
        }
        return;
      }
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) {
        e.preventDefault();
      }
      if (k === "m") {
        const next = state.mode === "orbit" ? "fly" : (state.mode === "fly" ? "fps" : "orbit");
        setMode(next);
        return;
      }
      state.keys[k] = true;
    });

    window.addEventListener("keyup", (e) => {
      state.keys[e.key.toLowerCase()] = false;
    });

    // Touch / Click D-pad bindings
    const dpadMap = [
      ["dpad-up", "arrowup"],
      ["dpad-down", "arrowdown"],
      ["dpad-left", "arrowleft"],
      ["dpad-right", "arrowright"]
    ];
    dpadMap.forEach(([id, keyName]) => {
      const btn = document.getElementById(id);
      btn.addEventListener("pointerdown", () => { state.keys[keyName] = true; });
      btn.addEventListener("pointerup", () => { state.keys[keyName] = false; });
      btn.addEventListener("pointerleave", () => { state.keys[keyName] = false; });
    });

    // =========================================================================
    // 9. FLOATING 2D ROOM LABELS & LIVE 2D MINIMAP
    // =========================================================================
    const labelsLayer = document.getElementById("labels-layer");
    const labelNodes = APARTMENT_DATA.rooms
      .filter((r) => !r.hiddenLabel)
      .map((r) => {
        const el = document.createElement("div");
        el.className = "room-label" + (r.customMod ? " custom-mod" : "");
        el.innerHTML = r.name + '<span class="dim">' + r.dim + "</span>";
        labelsLayer.appendChild(el);
        return { room: r, el, pos: new THREE.Vector3(r.x + r.w / 2, 1.35, r.z + r.d / 2) };
      });

    function updateLabels() {
      if (!state.showLabels) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      labelNodes.forEach((item) => {
        const v = item.pos.clone().project(camera);
        if (v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.1) {
          item.el.style.opacity = "0";
          return;
        }
        const sx = (v.x * 0.5 + 0.5) * w;
        const sy = (-v.y * 0.5 + 0.5) * h;
        item.el.style.left = sx + "px";
        item.el.style.top = sy + "px";
        item.el.style.opacity = state.mode === "fps" ? "0.65" : "0.95";
      });
    }

    const minimap = document.getElementById("minimap-canvas");
    const mctx = minimap.getContext("2d");
    const mapPad = 12;
    const mapMinX = -0.3, mapMaxX = 15.3;
    const mapMinZ = -2.0, mapMaxZ = 9.4;

    function worldToMap(x, z) {
      const sx = mapPad + ((x - mapMinX) / (mapMaxX - mapMinX)) * (minimap.width - mapPad * 2);
      const sy = mapPad + ((z - mapMinZ) / (mapMaxZ - mapMinZ)) * (minimap.height - mapPad * 2);
      return [sx, sy];
    }

    function mapToWorld(mx, my) {
      const wx = mapMinX + ((mx - mapPad) / (minimap.width - mapPad * 2)) * (mapMaxX - mapMinX);
      const wz = mapMinZ + ((my - mapPad) / (minimap.height - mapPad * 2)) * (mapMaxZ - mapMinZ);
      return [wx, wz];
    }

    minimap.addEventListener("click", (e) => {
      const rect = minimap.getBoundingClientRect();
      const [wx, wz] = mapToWorld(e.clientX - rect.left, e.clientY - rect.top);
      if (!collides(wx, wz)) {
        state.fpsPos.set(wx, 1.65, wz);
        setMode("fps");
        showToast("Teletransportado a: " + detectCurrentRoom(wx, wz));
      } else {
        showToast("Hacé clic dentro de un ambiente libre");
      }
    });

    function drawMinimap() {
      mctx.clearRect(0, 0, minimap.width, minimap.height);
      // Rooms
      APARTMENT_DATA.rooms.forEach((r) => {
        const [x1, y1] = worldToMap(r.x, r.z);
        const [x2, y2] = worldToMap(r.x + r.w, r.z + r.d);
        if (r.customMod) mctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        else if (r.isExterior) mctx.fillStyle = "rgba(180, 150, 110, 0.25)";
        else mctx.fillStyle = "rgba(148, 163, 184, 0.16)";
        mctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      });

      // Walls
      mctx.strokeStyle = "rgba(226, 232, 240, 0.8)";
      mctx.lineWidth = 1.6;
      APARTMENT_DATA.walls.forEach((w) => {
        const [x1, y1] = worldToMap(w.x1, w.z1);
        const [x2, y2] = worldToMap(w.x2, w.z2);
        mctx.beginPath();
        mctx.moveTo(x1, y1);
        mctx.lineTo(x2, y2);
        mctx.stroke();
      });

      // Player marker
      const px = state.mode === "fps" ? state.fpsPos.x : (state.mode === "fly" ? state.flyPos.x : state.orbitTarget.x);
      const pz = state.mode === "fps" ? state.fpsPos.z : (state.mode === "fly" ? state.flyPos.z : state.orbitTarget.z);
      const [mx, my] = worldToMap(px, pz);

      if (state.mode === "fps") {
        const dirX = -Math.sin(state.fpsYaw);
        const dirZ = -Math.cos(state.fpsYaw);
        const angle = Math.atan2(dirZ, dirX);
        mctx.fillStyle = "rgba(56, 189, 248, 0.32)";
        mctx.beginPath();
        mctx.moveTo(mx, my);
        mctx.arc(mx, my, 18, angle - 0.45, angle + 0.45);
        mctx.closePath();
        mctx.fill();
      }

      mctx.fillStyle = "#38bdf8";
      mctx.beginPath();
      mctx.arc(mx, my, 3.8, 0, Math.PI * 2);
      mctx.fill();
    }

    // =========================================================================
    // 10. MAIN RENDER LOOP
    // =========================================================================
    let lastTime = performance.now();

    function animate(now) {
      requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (state.mode === "fps") {
        const speed = 2.8 * dt;
        const turnSpeed = 1.9 * dt;
        const k = state.keys;

        if (k["q"]) state.fpsYaw += turnSpeed;
        if (k["e"]) state.fpsYaw -= turnSpeed;

        let moveForward = 0;
        let moveRight = 0;
        if (k["arrowup"] || k["w"]) moveForward += 1;
        if (k["arrowdown"] || k["s"]) moveForward -= 1;
        if (k["arrowright"] || k["d"]) moveRight += 1;
        if (k["arrowleft"] || k["a"]) moveRight -= 1;

        if (moveForward !== 0 || moveRight !== 0) {
          const fwdX = -Math.sin(state.fpsYaw);
          const fwdZ = -Math.cos(state.fpsYaw);
          const rightX = Math.cos(state.fpsYaw);
          const rightZ = -Math.sin(state.fpsYaw);

          const len = Math.hypot(moveForward, moveRight);
          const vx = ((fwdX * moveForward + rightX * moveRight) / len) * speed;
          const vz = ((fwdZ * moveForward + rightZ * moveRight) / len) * speed;

          // Separate X and Z collision checks so player slides smoothly along walls
          if (!collides(state.fpsPos.x + vx, state.fpsPos.z)) state.fpsPos.x += vx;
          if (!collides(state.fpsPos.x, state.fpsPos.z + vz)) state.fpsPos.z += vz;
        }

        currentRoomBadge.textContent = detectCurrentRoom(state.fpsPos.x, state.fpsPos.z);
        coordsReadout.textContent = "X " + state.fpsPos.x.toFixed(1) + "m · Z " + state.fpsPos.z.toFixed(1) + "m";
      } else if (state.mode === "fly") {
        const flySpeed = 6.5 * dt;
        const k = state.keys;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

        if (k["arrowup"] || k["w"]) state.flyPos.addScaledVector(dir, flySpeed);
        if (k["arrowdown"] || k["s"]) state.flyPos.addScaledVector(dir, -flySpeed);
        if (k["arrowright"] || k["d"]) state.flyPos.addScaledVector(right, flySpeed);
        if (k["arrowleft"] || k["a"]) state.flyPos.addScaledVector(right, -flySpeed);
        if (k["e"] || k[" "]) state.flyPos.y += flySpeed * 0.75;
        if (k["q"] || k["shift"]) state.flyPos.y -= flySpeed * 0.75;
        state.flyPos.y = Math.max(0.4, Math.min(28, state.flyPos.y));

        currentRoomBadge.textContent = "Vuelo Libre (sin pivote)";
        coordsReadout.textContent = "X " + state.flyPos.x.toFixed(1) + "m · Y " + state.flyPos.y.toFixed(1) + "m · Z " + state.flyPos.z.toFixed(1) + "m";
      } else {
        // Camera-relative free panning with arrow keys / WASD in Orbit mode
        const pan = 5.5 * dt;
        const fwd = new THREE.Vector3();
        camera.getWorldDirection(fwd);
        fwd.y = 0;
        if (fwd.lengthSq() < 0.0001) fwd.set(0, 0, -1);
        fwd.normalize();
        const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();

        if (state.keys["arrowup"] || state.keys["w"]) state.orbitTarget.addScaledVector(fwd, pan);
        if (state.keys["arrowdown"] || state.keys["s"]) state.orbitTarget.addScaledVector(fwd, -pan);
        if (state.keys["arrowleft"] || state.keys["a"]) state.orbitTarget.addScaledVector(right, -pan);
        if (state.keys["arrowright"] || state.keys["d"]) state.orbitTarget.addScaledVector(right, pan);

        currentRoomBadge.textContent = state.panTool ? "Maqueta · Mover libre" : "Vista Maqueta General";
        coordsReadout.textContent = "X " + state.orbitTarget.x.toFixed(1) + "m · Z " + state.orbitTarget.z.toFixed(1) + "m";
      }

      updateCameraFromState();
      renderer.render(scene, camera);
      updateLabels();
      drawMinimap();
    }

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    syncToggleButtons();
    updateCameraFromState();
    requestAnimationFrame(animate);
  
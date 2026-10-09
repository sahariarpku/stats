/* Stage 8 walkthroughs: relationships. */

Walk.register("multiple-regression", {"title": "Multiple regression: from a line to a plane (3D)", "lesson": "8.4", "terms": ["Multiple regression", "Partial slope"]}, (S, A) => {
  // Twelve students: hours of study, hours of sleep, exam score (made-up but realistic numbers).
  const study = [1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 8];
  const sleep = [5, 7, 4, 6, 8, 5, 7, 4, 8, 6, 5, 9];
  const score = [52, 66, 50, 63, 78, 63, 75, 64, 85, 77, 72, 93];
  // least-squares plane score = b0 + b1*study + b2*sleep (normal equations, solved here so the numbers are exact)
  const n = study.length;
  const X = study.map((s, i) => [1, s, sleep[i]]);
  const XtX = [0, 1, 2].map((p) => [0, 1, 2].map((q) => X.reduce((t, r) => t + r[p] * r[q], 0)));
  const Xty = [0, 1, 2].map((p) => X.reduce((t, r, i) => t + r[p] * score[i], 0));
  const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det3(XtX);
  const b = [0, 1, 2].map((k) => det3(XtX.map((row, i) => row.map((v, j) => (j === k ? Xty[i] : v)))) / D);
  const fit = (s, z) => b[0] + b[1] * s + b[2] * z;
  // map data to 3D coordinates: x = study, z = sleep, y = score
  const mx = (s) => (s / 8) * 4 - 2, mz = (z) => ((z - 4) / 5) * 4 - 2, my = (y) => ((y - 45) / 50) * 3 - 1.5;
  let T, group, plane, sticks, arrowStudy, arrowSleep, pillStudy, labels = [], angle = 0, clock = 0;
  const BASE = -2.3, ELEV = 3.8;   // view from the low corner, so the plane faces the camera

  async function setup() {
    T = await S.three({ fov: 36 });
    const { THREE, scene, camera } = T;
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(3, 6, 4); scene.add(dl);
    group = new THREE.Group(); scene.add(group);
    const css = getComputedStyle(document.documentElement);
    const c = (name) => new THREE.Color(css.getPropertyValue(name).trim() || "#888");
    const axisMat = new THREE.LineBasicMaterial({ color: c("--ink-3") });
    const o = [-2, -1.5, -2];
    [[2, -1.5, -2], [-2, 1.6, -2], [-2, -1.5, 2]].forEach((p) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...o), new THREE.Vector3(...p)]);
      group.add(new THREE.Line(g, axisMat));
    });
    // floor grid
    const grid = new THREE.GridHelper(4, 8, c("--line"), c("--line")); grid.position.y = -1.5; group.add(grid);
    const dotMat = new THREE.MeshStandardMaterial({ color: c("--w-blue"), roughness: 0.4 });
    const sphere = new THREE.SphereGeometry(0.11, 24, 16);
    T.dots = study.map((s, i) => { const m = new THREE.Mesh(sphere, dotMat); m.position.set(mx(s), my(score[i]), mz(sleep[i])); m.scale.setScalar(0.001); group.add(m); return m; });
    T.c = c;
    labels = [["study (hours)", [2.3, -1.5, -2]], ["sleep (hours)", [-2, -1.5, 2.4]], ["exam score ↑", [-2, 2.05, -2]]].map(([txt, p]) => ({ t: S.text(0, 0, txt, { size: 18, weight: 700, color: "ink2" }), p }));
    const place = () => labels.forEach((l) => { const v = new T.THREE.Vector3(...l.p).applyMatrix4(group.matrixWorld); const [px, py] = T.project(v.x, v.y, v.z); l.t.setAttribute("x", px); l.t.setAttribute("y", py); l.t.querySelectorAll("tspan").forEach((ts) => ts.setAttribute("x", px)); });
    const view = () => { angle = BASE + 0.32 * Math.sin(clock); camera.position.set(Math.sin(angle) * 8.6, ELEV, Math.cos(angle) * 8.6); camera.lookAt(0, -0.2, 0); group.updateMatrixWorld(); place(); T.render(); };
    T.view = view;
    view();
    A.loop((dt) => { clock += dt * 0.00035; view(); });
  }
  function makePlane() {
    const { THREE } = T;
    const geo = new THREE.BufferGeometry();
    const corners = [[0, 4], [8, 4], [8, 9], [0, 9]].map(([s, z]) => new THREE.Vector3(mx(s), my(fit(s, z)), mz(z)));
    geo.setFromPoints([corners[0], corners[1], corners[2], corners[0], corners[2], corners[3]]);
    geo.computeVertexNormals();
    const mat = new THREE.MeshBasicMaterial({ color: T.c("--w-orange"), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    plane = new THREE.Mesh(geo, mat);
    group.add(plane);
    const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(corners), new THREE.LineBasicMaterial({ color: T.c("--w-orange"), transparent: true, opacity: 0 }));
    group.add(edge);
    plane.edge = edge;
  }
  function arrow3(from, to, color) {
    const { THREE } = T;
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const a = new THREE.ArrowHelper(dir.normalize(), from, len, color, 0.28, 0.16);
    a.line.material.linewidth = 3;
    group.add(a);
    return a;
  }

  return [
    {
      say: "Twelve students. For each one we know three numbers: **hours of study**, **hours of sleep** and their **exam score**. Three numbers means each student is a dot in **3D space**. (The view sways gently so you can see the depth.)",
      run: async () => {
        await setup();
        await A.tween(900, (t) => T.dots.forEach((d, i) => d.scale.setScalar(Math.max(0.001, Math.min(1, t * 1.6 - i * 0.05)))));
        T.dots.forEach((d) => d.scale.setScalar(1));
        T.view();
      },
    },
    {
      say: `With one predictor, regression draws the best **line**. With two predictors it draws the best flat **plane** through the cloud. Here: **score = ${b[0].toFixed(1)} + ${b[1].toFixed(2)} × study + ${b[2].toFixed(2)} × sleep**.`,
      run: async () => {
        makePlane();
        await A.tween(900, (t) => { plane.material.opacity = 0.38 * t; plane.edge.material.opacity = t; T.view(); });
      },
    },
    {
      say: "Each student's **residual** is the stick from their dot to the plane: how far the prediction missed (sticks above the plane are students who did better than predicted). Least squares tilts the plane so these misses, squared and added up, are as small as possible.",
      run: async () => {
        const { THREE } = T;
        const mat = new THREE.LineBasicMaterial({ color: T.c("--w-purple") });
        sticks = study.map((s, i) => {
          const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(mx(s), my(score[i]), mz(sleep[i])), new THREE.Vector3(mx(s), my(fit(s, sleep[i])), mz(sleep[i]))]);
          const l = new THREE.Line(g, mat); l.visible = false; group.add(l); return l;
        });
        for (let i = 0; i < sticks.length; i++) { sticks[i].visible = true; T.view(); await A.wait(90); }
      },
    },
    {
      say: `**Partial slope for study** = ${b[1].toFixed(2)}. Walk across the plane in the study direction while **sleep stays fixed**: the predicted score rises about ${b[1].toFixed(1)} points for every extra hour of study.`,
      run: async () => {
        const { THREE } = T;
        const z = 6.5;
        arrowStudy = arrow3(new THREE.Vector3(mx(1), my(fit(1, z)) + 0.02, mz(z)), new THREE.Vector3(mx(7), my(fit(7, z)) + 0.02, mz(z)), T.c("--w-blue"));
        T.view();
        pillStudy = S.pill(400, 410, `+${b[1].toFixed(1)} points per hour of study (sleep held fixed)`, { size: 19, color: "blue", hide: true });
        await A.fadeIn(pillStudy);
      },
    },
    {
      say: `**Partial slope for sleep** = ${b[2].toFixed(2)}. Now hold **study fixed** and walk in the sleep direction: about ${b[2].toFixed(1)} more points per extra hour of sleep. Each slope answers "what does this one change, if the others stay put?"`,
      run: async () => {
        const { THREE } = T;
        const s = 4;
        arrowSleep = arrow3(new THREE.Vector3(mx(s), my(fit(s, 4.5)) + 0.02, mz(4.5)), new THREE.Vector3(mx(s), my(fit(s, 8.5)) + 0.02, mz(8.5)), T.c("--w-green"));
        T.view();
        await A.fadeOut(pillStudy);
        const p = S.pill(400, 410, `+${b[2].toFixed(1)} points per hour of sleep (study held fixed)`, { size: 19, color: "green", hide: true });
        await A.fadeIn(p);
      },
    },
  ];
});

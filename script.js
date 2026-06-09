import * as THREE from "three";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    setTimeout(() => loader.classList.add("is-done"), 650);
  }
});

const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav__links");

const onScroll = () => {
  if (window.scrollY > 24) nav.classList.add("is-stuck");
  else nav.classList.remove("is-stuck");
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (navToggle && navLinks) {
  const mqMobile = window.matchMedia("(max-width: 900px)");

  let savedScrollY = 0;

  const setMenu = (open) => {
    navLinks.classList.toggle("is-open", open);
    nav.classList.toggle("is-menu-open", open);
    const isMobile = mqMobile.matches;
    if (open && isMobile) {
      savedScrollY = window.scrollY;
      document.documentElement.classList.add("nav-open");
      document.body.classList.add("nav-open");
      document.body.style.top = `-${savedScrollY}px`;
    } else {
      document.documentElement.classList.remove("nav-open");
      document.body.classList.remove("nav-open");
      document.body.style.top = "";
      window.scrollTo(0, savedScrollY);
    }
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open && isMobile) {
      const first = navLinks.querySelector("a");
      if (first) first.focus();
    }
  };

  navToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("is-open")));

  mqMobile.addEventListener("change", () => {
    if (!mqMobile.matches) setMenu(false);
  });

  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (!navLinks.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      setMenu(false);
      navToggle.focus();
      return;
    }
    if (e.key === "Tab" && mqMobile.matches) {
      const focusables = [navToggle, ...navLinks.querySelectorAll("a")];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      formStatus.textContent = "Please complete the highlighted fields.";
      formStatus.classList.add("is-error");
      return;
    }
    const data = new FormData(contactForm);
    const project = data.get("project");
    const subject = encodeURIComponent("Project inquiry — " + project);
    const body = encodeURIComponent(
      "Name: " + data.get("name") + "\n" +
      "Email: " + data.get("email") + "\n" +
      "Project: " + project + "\n\n" +
      data.get("message")
    );
    formStatus.classList.remove("is-error");
    formStatus.textContent = "Opening your email app — if nothing happens, write to hello@gojointeriors.com.";
    window.location.href = "mailto:hello@gojointeriors.com?subject=" + subject + "&body=" + body;
    contactForm.reset();
  });
}

const revealEls = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}

const canvas = document.getElementById("heroCanvas");

function initThree() {
  if (!canvas || reduceMotion) return;

  const hero = canvas.parentElement;
  let width = hero.clientWidth;
  let height = hero.clientHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(width, height, false);

  const ambient = new THREE.AmbientLight(0xfbf4ec, 0.7);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff3e2, 1.5);
  keyLight.position.set(6, 8, 6);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xb08d57, 8, 60);
  rimLight.position.set(-8, -4, 6);
  scene.add(rimLight);

  const fill = new THREE.PointLight(0x5c1a2b, 6, 50);
  fill.position.set(6, -6, -4);
  scene.add(fill);

  const panelGroup = new THREE.Group();
  scene.add(panelGroup);

  const panelGeo = new THREE.PlaneGeometry(4.4, 3, 1, 1);
  const panelColors = [0xf4ece4, 0xefe5da, 0xf6efe7, 0xe9dccd];
  const panelCount = 7;

  for (let i = 0; i < panelCount; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: panelColors[i % panelColors.length],
      roughness: 0.82,
      metalness: 0.04,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(panelGeo, mat);
    const t = i / panelCount;
    mesh.position.set(
      Math.cos(t * Math.PI * 2) * 5.2,
      (t - 0.5) * 7,
      Math.sin(t * Math.PI * 2) * 4 - 3
    );
    mesh.rotation.set(t * 1.6 - 0.4, t * 2.2, t * 0.7 - 0.3);
    mesh.scale.setScalar(0.5 + t * 0.9);
    mesh.userData.spin = 0.04 + t * 0.05;
    mesh.userData.floatPhase = t * Math.PI * 2;
    mesh.userData.baseY = mesh.position.y;
    panelGroup.add(mesh);
  }

  const dustCount = 320;
  const positions = new Float32Array(dustCount * 3);
  const speeds = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    speeds[i] = 0.05 + Math.random() * 0.12;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xc9a86f,
    size: 0.05,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  let scrollFactor = 0;
  window.addEventListener(
    "scroll",
    () => {
      const h = hero.offsetHeight || 1;
      scrollFactor = Math.min(window.scrollY / h, 1);
    },
    { passive: true }
  );

  const clock = new THREE.Clock();
  let running = true;

  const heroObserver = new IntersectionObserver(
    (entries) => {
      running = entries[0].isIntersecting;
      if (running) renderLoop();
    },
    { threshold: 0.02 }
  );
  heroObserver.observe(hero);

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  window.addEventListener("resize", resize);

  function renderLoop() {
    if (!running) return;
    const t = clock.getElapsedTime();

    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    panelGroup.rotation.y = t * 0.045 + pointer.x * 0.25;
    panelGroup.rotation.x = pointer.y * 0.18 - scrollFactor * 0.4;
    panelGroup.position.y = scrollFactor * 3;

    panelGroup.children.forEach((mesh) => {
      mesh.rotation.z += mesh.userData.spin * 0.01;
      mesh.position.y = mesh.userData.baseY + Math.sin(t * 0.4 + mesh.userData.floatPhase) * 0.4;
    });

    const pos = dustGeo.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.02;
      if (pos[i * 3 + 1] > 9) pos[i * 3 + 1] = -9;
    }
    dustGeo.attributes.position.needsUpdate = true;
    dust.rotation.y = t * 0.02 + pointer.x * 0.1;

    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.y * 0.8 - camera.position.y) * 0.05;
    camera.lookAt(0, scrollFactor * 1.5, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
}

initThree();

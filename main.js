(function () {
  var nav = document.getElementById("nav");
  var links = document.getElementById("nav-links");
  var toggle = document.querySelector(".nav-toggle");
  var bar = document.querySelector(".scroll-progress span");
  var glow = document.querySelector(".pointer-glow");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy");
      navigator.clipboard.writeText(value).then(function () {
        var previous = button.textContent;
        button.textContent = "Copied";
        button.classList.add("copied");
        setTimeout(function () {
          button.textContent = previous;
          button.classList.remove("copied");
        }, 1400);
      });
    });
  });

  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  links.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("scrolled", y > 12);
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!reduce) {
    window.addEventListener("pointermove", function (event) {
      glow.style.transform = "translate3d(" + event.clientX + "px," + event.clientY + "px,0)";
    }, { passive: true });
  }

  var canvas = document.getElementById("fx");
  if (reduce || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var width = 0;
  var height = 0;
  var petals = [];
  var sparks = [];

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makePetal(below) {
    return {
      x: Math.random() * width,
      y: below ? Math.random() * height : -20 - Math.random() * height,
      r: 5 + Math.random() * 8,
      speed: 0.35 + Math.random() * 1.05,
      angle: Math.random() * Math.PI,
      spin: 0.008 + Math.random() * 0.02,
      drift: 0.35 + Math.random() * 0.9,
      color: Math.random() > 0.45 ? "rgba(240,183,198," : "rgba(255,228,214,"
    };
  }

  function makeSpark() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.5 + Math.random() * 1.7,
      speed: 0.12 + Math.random() * 0.4,
      alpha: 0.25 + Math.random() * 0.65,
      phase: Math.random() * Math.PI * 2
    };
  }

  resize();
  var petalCount = width < 720 ? 14 : 32;
  var sparkCount = width < 720 ? 24 : 56;
  for (var i = 0; i < petalCount; i++) petals.push(makePetal(true));
  for (var j = 0; j < sparkCount; j++) sparks.push(makeSpark());
  window.addEventListener("resize", resize);

  function frame() {
    ctx.clearRect(0, 0, width, height);
    for (var p = 0; p < petals.length; p++) {
      var petal = petals[p];
      petal.y += petal.speed;
      petal.x += Math.sin(petal.y * 0.012) * petal.drift;
      petal.angle += petal.spin;
      if (petal.y > height + 24) {
        petal.y = -24;
        petal.x = Math.random() * width;
      }
      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.angle);
      ctx.fillStyle = petal.color + "0.82)";
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.r, petal.r * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (var s = 0; s < sparks.length; s++) {
      var spark = sparks[s];
      spark.y -= spark.speed;
      spark.phase += 0.045;
      if (spark.y < -6) {
        spark.y = height + 6;
        spark.x = Math.random() * width;
      }
      var alpha = spark.alpha * (0.4 + 0.6 * Math.sin(spark.phase));
      ctx.beginPath();
      ctx.fillStyle = "rgba(232,193,90," + alpha + ")";
      ctx.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

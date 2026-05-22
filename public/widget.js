(function () {
  var script = document.currentScript;
  if (!script) return;

  var botId = script.getAttribute("data-bot-id");
  var apiKey = script.getAttribute("data-api-key");
  var base = script.src.replace(/\/widget\.js.*$/, "");

  if (!botId || !apiKey) {
    console.warn("[ChatForge] Missing data-bot-id or data-api-key");
    return;
  }

  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML = "💬";
  btn.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:99999;width:56px;height:56px;border-radius:50%;border:none;background:#6366f1;color:#fff;font-size:24px;cursor:pointer;box-shadow:0 8px 32px rgba(99,102,241,.45);";

  var frame = document.createElement("iframe");
  frame.style.cssText =
    "display:none;position:fixed;bottom:96px;right:24px;z-index:99998;width:380px;max-width:calc(100vw - 48px);height:520px;max-height:calc(100vh - 120px);border:none;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.35);";
  frame.src = base + "/widget/" + botId + "?key=" + encodeURIComponent(apiKey);

  var open = false;
  btn.addEventListener("click", function () {
    open = !open;
    frame.style.display = open ? "block" : "none";
  });

  document.body.appendChild(btn);
  document.body.appendChild(frame);
})();

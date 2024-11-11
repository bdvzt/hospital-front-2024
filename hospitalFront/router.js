export function navigateTo(path) {
  window.history.pushState({}, path, path);
  handleLocation();
}

document.body.addEventListener("click", (event) => {
  const target = event.target;

  if (target.getAttribute("href")) {
    event.preventDefault();
    const path = target.getAttribute("href");
    navigateTo(path);
  }
});

const routes = {
  404: "/hospitalFront/html/404.html",
  "/login": "/hospitalFront/html/login/login.html",
  "/registration": "/hospitalFront/html/registration/registration.html",
  "/profile": "/hospitalFront/html/profile/profile.html",
  "/reports": "/hospitalFront/html/reports/reports.html",
  "/consultations": "/hospitalFront/html/consultation/consultation.html",
  "/patients": "/hospitalFront/html/listPatients/list.html",
  "/patient/:id": "/hospitalFront/html/medicalCard/patient.html",
  "/createInspection": "/hospitalFront/html/createInspection/inspection.html",
  "/inspection/:id": "/hospitalFront/html/details/details.html",
};

const handleLocation = async () => {
  const path = window.location.pathname;
  let route = routes[404];
  let params = {};

  for (const routePath in routes) {
    const dynamicRouteRegex = new RegExp(
      `^${routePath.replace(/:\w+/g, "([^/]+)")}$`
    );
    const match = path.match(dynamicRouteRegex);

    if (match) {
      route = routes[routePath];

      const paramNames = (routePath.match(/:\w+/g) || []).map((param) =>
        param.substring(1)
      );
      params = paramNames.reduce((acc, paramName, index) => {
        acc[paramName] = match[index + 1];
        return acc;
      }, {});
      break;
    }
  }

  try {
    const html = await fetch(route).then((data) => data.text());
    const routerContainer = document.getElementById("routerContainer");

    if (routerContainer) {
      routerContainer.innerHTML = html;
    }

    const scriptsContainer = document.getElementById("scriptsContainer");
    while (scriptsContainer.firstChild) {
      scriptsContainer.removeChild(scriptsContainer.firstChild);
    }

    const scripts = routerContainer.getElementsByTagName("script");
    for (const script of scripts) {
      const newScript = document.createElement("script");
      newScript.src = script.src + "?t=" + Date.now();
      newScript.type = "module";
      scriptsContainer.appendChild(newScript);
    }
  } catch (error) {
    console.error("Error fetching content:", error);
  }
};

window.onpopstate = handleLocation;

document.addEventListener("DOMContentLoaded", () => {
  if (location.pathname == "/") {
    if (localStorage.getItem("token")) {
      navigateTo("/profile");
    } else {
      navigateTo("/login");
    }
  } else {
    navigateTo(location.href);
  }
});

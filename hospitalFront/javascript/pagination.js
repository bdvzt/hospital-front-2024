import { navigateTo } from "/hospitalFront/router.js";

export function createPaginationBlock(paginationInfo) {
  const paginationContainer = document.getElementById("paginationContainer");
  paginationContainer.innerHTML = ``;

  const paginationNav = document.createElement("nav");
  const paginationUl = document.createElement("ul");
  paginationUl.classList.add("pagination", "justify-content-center");

  paginationNav.appendChild(paginationUl);
  paginationContainer.appendChild(paginationNav);

  function createPageItem(pageName, pageNumber, currentPage, countPages) {
    const pageItem = document.createElement("li");
    pageItem.classList.add("page-item");

    if (pageName == currentPage) {
      pageItem.classList.add("active");
    }
    if ((pageName == "<" || pageName == "<<") && currentPage == 1) {
      pageItem.classList.add("disabled");
    }
    if ((pageName == ">" || pageName == ">>") && currentPage == countPages) {
      pageItem.classList.add("disabled");
    }

    const pageLink = document.createElement("a");
    pageLink.classList.add("page-link");
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", pageNumber);
    pageLink.href = location.pathname + "?" + searchParams.toString();
    pageLink.textContent = pageName;

    pageLink.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(pageLink.href);
    });

    pageItem.appendChild(pageLink);
    return pageItem;
  }

  let start = Math.max(1, paginationInfo.current - 2);
  let end = Math.min(paginationInfo.current + 2, paginationInfo.count);
  if (paginationInfo.current < 3) {
    start = 1;
    end = Math.min(start + 4, paginationInfo.count);
  } else if (paginationInfo.current + 2 >= paginationInfo.count) {
    end = paginationInfo.count;
    start = Math.max(end - 4, 1);
  }

  const firstPage = createPageItem(
    "<<",
    1,
    paginationInfo.current,
    paginationInfo.count
  );
  paginationUl.appendChild(firstPage);
  const previousPage = createPageItem(
    "<",
    paginationInfo.current - 1,
    paginationInfo.current,
    paginationInfo.count
  );
  paginationUl.appendChild(previousPage);
  for (let i = start; i <= end; i++) {
    const pageItem = createPageItem(
      i,
      i,
      paginationInfo.current,
      paginationInfo.count
    );
    paginationUl.appendChild(pageItem);
  }
  const nextPage = createPageItem(
    ">",
    paginationInfo.current + 1,
    paginationInfo.current,
    paginationInfo.count
  );
  const lastPage = createPageItem(
    ">>",
    paginationInfo.count,
    paginationInfo.current,
    paginationInfo.count
  );
  paginationUl.appendChild(nextPage);
  paginationUl.appendChild(lastPage);
}

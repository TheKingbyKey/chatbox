document.addEventListener("DOMContentLoaded",()=>{
  const div = document.querySelector(".first");
  div.addEventListener("animationend",()=>{
    div.style.display = "none";
    document.querySelector(".base").style.display="flex";
    document.querySelector(".base").style.flexDirection="column";
  });
});

document.addEventListener("DOMContentLoaded",()=>{
  if(!localStorage.getItem("username")){
    window.location.href = "http://localhost:5000/";
  }else{
    if(localStorage.getItem("channel")){
      window.location.href = "http://localhost:5000/channel";
    }
  }
});

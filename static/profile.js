document.addEventListener("DOMContentLoaded",()=>{
  if(window.innerWidth<701){
    document.querySelector(".major").className = "col-12 major";
    document.querySelector(".minor").className = "col-12 minor collapse";
  }else{
    document.querySelector(".major").className = "col-9 major";
    document.querySelector(".minor").className = "col-3 minor";
  }
  window.addEventListener("resize",()=>{
    if(window.innerWidth<701){
      document.querySelector(".major").className = "col-12 major";
      document.querySelector(".minor").className = "col-12 minor collapse";
    }else{
      document.querySelector(".major").className = "col-9 major";
      document.querySelector(".minor").className = "col-3 minor";
    }
  });

  document.querySelector("#username").innerHTML = localStorage.getItem("username");
  document.querySelector("#user").innerHTML = localStorage.getItem("variable");
  document.querySelector("#logout").onclick = ()=>{
    localStorage.removeItem("username");
    window.location.href = "http://localhost:5000/";
  };


  document.addEventListener("click",event=>{
    const ele = event.target;
    if(ele.className === "btn btn-link channelLink"){
      let name = ele.innerHTML;
      localStorage.setItem("channel",name);
      window.location.href = "http://localhost:5000/channel";
    }else if(ele.id === "username"){
      window.location.href = "http://localhost:5000/room";
      return false;
    }
  });
  const template = Handlebars.compile(document.querySelector("#channellist").innerHTML);
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);


  socket.on("connect",()=>{

    socket.emit("get channels");

    socket.emit("ask details",{"username":localStorage.getItem("variable")});

});


  socket.on("create channel success",data=>{
    let channels = [];
    channels.push(data.name);
    const content = template({"values":channels});
    document.querySelector("#dekstopchannels").innerHTML += content;
  });





  socket.on("get details",data=>{
    if(!data.success){
      alert("ERROR WHILE LOADING press ctrl+Shift+R");
    }else{
      document.querySelector("#name").innerHTML = data.name;
      document.querySelector("#email").innerHTML = data.email;
      document.querySelector("#address").innerHTML = data.address;
      document.querySelector("#company").innerHTML = data.company;
      var d = new Date();
      var str = d.getTime();
      document.querySelector("#profile").src = `/static/uploads/profile/${data.pic}?rnd=${str}`;
    }
  });



  socket.on("send channels",data=>{
    const content = template({"values":data.channels});
    document.querySelector("#dekstopchannels").innerHTML = content;
  });
});

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
  document.querySelector("#user").innerHTML = localStorage.getItem("username");
  document.querySelector("#logout").onclick = ()=>{
    localStorage.removeItem("username");
    window.location.href = "http://localhost:5000/";
  };

  document.querySelector("#password-Invalid").style.display = "none";
  document.querySelector("#username-Invalid").style.display = "none";
  document.querySelector("#change-info").style.display = "none";
  document.querySelector("#edit-profile").onclick = ()=>{
    document.querySelector("#change-info").style.display = "block";
    document.querySelector("#show-info").style.display = "none";
  };

  document.querySelector("#password2-Invalid").style.display = "none";
  document.querySelector("#channelname-Invalid").style.display = "none";
  document.querySelector("#create-channel2").style.display = "none";
  document.addEventListener("click",event=>{
    const ele = event.target;
    if(ele.className === "create-channel btn btn-success"){
      document.querySelector("#create-channel2").style.display = "block";
      document.querySelector("#show-info").style.display = "none";
      document.querySelector("#change-info").style.display = "none";
    }else if(ele.className === "back btn btn-success"){
      document.querySelector("#change-info").style.display = "none";
      document.querySelector("#create-channel2").style.display = "none";
      document.querySelector("#show-info").style.display = "table";
    }
    if(ele.className === "btn btn-link channelLink"){
      let name = ele.innerHTML;
      localStorage.setItem("channel",name);
      window.location.href = "http://localhost:5000/channel";
    }
  });
  const template = Handlebars.compile(document.querySelector("#channellist").innerHTML);
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);


  socket.on("connect",()=>{

    socket.emit("get channels");

    socket.emit("ask details",{"username":localStorage.getItem("username")});
    document.querySelector("#uploadpic1").onclick = ()=>{
      document.querySelector("#pic1").click();

    };
    document.querySelector("#pic1").onchange = ()=>{
      var x = document.querySelector("#pic1");
      if('files' in x){
        if(x.files.length>0){
          var file = x.files[0];
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = ()=>{
            var buff = reader.result;
            socket.emit("upload image",{"filename":file.name,"binary":buff,"username":localStorage.getItem("username")});
          };
        }
      }
    };

    document.querySelector("#change-info").onsubmit = ()=>{
      let hasusername = false;
      let username = document.querySelector("#username2").value;
      let haspassword = false;
      let password = document.querySelector("#password").value;
      let hasaddress = false;
      let address = document.querySelector("#address2").value;
      let hascompany = false;
      let company = document.querySelector("#company2").value;
      let checkpassword = document.querySelector("#cpassword").value;
      if( username.length>0){
        hasusername = true;
      }
      if(password.length>0){
        haspassword = true;
      }
      if(address.length>0){
        hasaddress = true;
      }
      if(company.length>0){
        hascompany = true;
      }
      socket.emit("editprofile",{"confirm_username":localStorage.getItem("username"),"username":{"has":hasusername,"value":username},"password":{"has":haspassword,"value":password},"address":{"has":hasaddress,"value":address},"company":{"has":hascompany,"value":company},"confirm_password":checkpassword});
      return false;
    };

    document.querySelector("#mode").onchange = ()=>{
      if(document.querySelector("#mode").value === "private"){
         document.querySelector("#passwordchannel").disabled = false;
         document.querySelector("#passwordchannel").required = true;
    }else{
      document.querySelector("#passwordchannel").disabled = true;
      document.querySelector("#passwordchannel").required = false;
    }
    };
    document.querySelector("#create-channel2").onsubmit = ()=>{
      let name = document.querySelector("#channelname").value;
      let mode = document.querySelector("#mode").value;
      let password = document.querySelector("#passwordchannel").value;
      let checkpassword = document.querySelector("#cpassword2").value;
      socket.emit("create channel",{"confirm_username":localStorage.getItem("username"),"name":name,"mode":mode,"password":password,"confirm_password":checkpassword});
      return false;
    };
});

  socket.on("create channel fail",data=>{
    if(!data.passwordsuccess)
       document.querySelector("#password2-Invalid").style.display = "block";
    if(!data.channelsuccess)
       document.querySelector("#channelname-Invalid").style.display = "block";
  });

  socket.on("create channel success",data=>{
    document.querySelector("#create-channel2").style.display = "none";
    document.querySelector("#show-info").style.display = "table";
    let channels = [];
    channels.push(data.name);
    const content = template({"values":channels});
    document.querySelector("#dekstopchannels").innerHTML += content;
  });

  socket.on("success-edit",data=>{
    document.querySelector("#change-info").style.display = "none";
    document.querySelector("#show-info").style.display = "table";
    localStorage.setItem("username",data.username)
    document.querySelector("#address").innerHTML = data.address;
    document.querySelector("#company").innerHTML = data.company;
    document.querySelector("#username").innerHTML = localStorage.getItem("username");
    document.querySelector("#user").innerHTML = localStorage.getItem("username");
  });

  socket.on("fail-edit",data=>{
    if(!data.passwordsuccess){
      document.querySelector("#password-Invalid").style.display = "block";
    }else if(!data.usersuccess){
      document.querySelector("#username-Invalid").style.display = "block";
    }
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

  socket.on("send image",data=>{
    var d = new Date();
    var str = d.getTime();
    document.querySelector("#profile").src = `/static/uploads/profile/${data.pic}?rnd=${str}`;
  });

  socket.on("send channels",data=>{
    const content = template({"values":data.channels});
    document.querySelector("#dekstopchannels").innerHTML = content;
  });
});

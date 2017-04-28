var sShow = {
  curPic: "0",
  imOffset:"0",
  maxViewable:"0",

  findTarget: function(e)
  {
    var target;

    if (window.event && window.event.srcElement)
      target = window.event.srcElement;
    else if (e && e.target)
      target = e.target;
    if (!target)
      return null;

    return target;
  },

  addEvent: function(elm, evType, fn, useCapture)
  {
    if(elm.addEventListener)
    {
      elm.addEventListener(evType, fn, useCapture);
      return true;
    }
    else if(elm.attachEvent)
    {
      return elm.attachEvent('on' + evType, fn);
      //EventCache.add(elm, evType, fn);
    }
    else
    {
      elm['on' + evType] = fn;
    }
  },


  updateContent: function(myImages)
  {
    var total = myImages.length;
    var imStart = 0;
    var imEnd = total;
    var i;

    if(total > sShow.maxViewable)
    {
      imStart = sShow.curPic - sShow.imOffset;

      if(imStart < 0)
      {
        imStart = 0;
      }
      if(imStart > (total - sShow.maxViewable))
      {
        imStart = total - sShow.maxViewable;
      }

      imEnd = sShow.curPic + sShow.imOffset;

      if(imEnd-imStart < sShow.maxViewable)
      {
        imEnd = imStart + sShow.maxViewable;
      }
      if(imEnd > total)
      {
        imEnd = total;
      }
    }
    var prevSlide = ((sShow.curPic) % (total + 2));
    if(sShow.curPic == 0)
      prevSlide = total;
    var spans = document.getElementsByTagName('span');
    if(!spans)
    {
      return;
    }
    var j = 0;
    for(i = 0; i < spans.length; i++)
    {
      if(spans[i].className == "current")
        spans[i].className = "slideLink";
      if(spans[i].className == "slideLink")
      {
        if(j < imStart || j >= imEnd)
        {
          spans[i].style.display = "none";
        }
        else
        {
           spans[i].style.display = "inline";
           spans[i].setAttribute('title', 'Click to move directly to slide  ' + (j + 1))
        }
        if(j == sShow.curPic)
        {
          spans[i].className = "current";
          spans[i].setAttribute('title', 'The current slide.');
        }
        j++;
      }
    }

    var pr = document.getElementById("picRange");

    if(!pr)
    {
      return;
    }
    var pL = pr.childNodes.length;
    for(var i = 0; i < pL; i++)
      pr.removeChild(pr.childNodes[0]);

    txt = document.createTextNode("" + (sShow.curPic + 1) + " of " + myImages.length + ":");
    pr.appendChild(txt);

    var pb = document.getElementById("PictureBox");
    if(!pb)
    {
      return;
    }
    while(pb.firstChild){pb.removeChild(pb.firstChild);}
    //var iL = pb.childNodes.length;
    //for(var i = 0; i < iL; i++)
    //  pb.removeChild(pb.childNodes[0]);

    var image = document.createElement('img');
    image.setAttribute('src', prefix + myImages[sShow.curPic].src);
    image.className = 'bordered';
    pb.appendChild(image);
    pb.style.textAlign="center";

    var cap = document.getElementById("CaptionBox");
    if(!cap)
    {
      return;
    }
    iL = cap.childNodes.length;
    for(var i = 0; i < iL; i++)
      cap.removeChild(cap.childNodes[0]);
    txt = document.createTextNode(myImages[sShow.curPic].caption);
    cap.appendChild(txt);
    cap.style.textAlign="center";
  },


  showSlide: function(evt)
  {
    var index = sShow.findTarget(evt).id.split("_");

    sShow.curPic = parseInt(index[1]);

    sShow.updateContent(pictures);
  },

  changeSlide: function(direction, myImages)
  {
    var total = myImages.length-1;

    if(document.images)
    {
      sShow.curPic += direction;
      if(sShow.curPic > total)
      {
        sShow.curPic = 0;
      }
      if(sShow.curPic < 0)
      {
        sShow.curPic = total;
      }
      sShow.updateContent(myImages);
    }
  },

  changeLeft: function()
  {
    sShow.changeSlide(-1, pictures);
  },

  changeRight: function()
  {
    sShow.changeSlide(1, pictures);
  },

  startSlide: function()
  {
    /*
      This little lot is needed to allow both Internet explorer and
      Firefox to handle the arrow keys. The page moves in IE if onkeypress
      is used, similarly for Firefox if onkeydown is used. Opera moves the
      page whatever and however it is set up.
    */
    if (navigator.appName.indexOf("Microsoft")!=-1)
    {
       document.onkeydown = sShow.checkKeyPressed;
    }
    else if(navigator.appName.indexOf("Netscape")!=-1)
    {
       document.onkeypress = sShow.checkKeyPressed;
    }

    if(!document.getElementById || !document.getElementsByTagName)
      return;

    sShow.curPic = 0;
    sShow.imOffset = 4;
    sShow.maxViewable = (sShow.imOffset * 2) + 1;
    myImages = pictures;
    var i;
    var navBar = document.getElementById("navigation");
    if(!navBar)
    {
      return;
    }
    var ns = document.createElement('span');
    if(!ns)
    {
      return;
    }
    ns.appendChild(document.createTextNode("[previous]"));

    ns.className="navArrow";
    sShow.addEvent(ns, 'click', sShow.changeLeft, false);
    ns.setAttribute('title', 'Click to move to previous slide ');
    navBar.appendChild(ns);

    for(i = 0; i < myImages.length; i++)
    {
       ns = document.createElement('span');
       ns.appendChild(document.createTextNode( '  ' + (i + 1) + '  '));
       sShow.addEvent(ns, 'click', sShow.showSlide, false);
       if(0 == i)
       {
         ns.className = "current";
       }
       else
       {
         ns.className = "slideLink";
       }
       ns.id = "ssL_"+ i;
       ns.style.display = "inline";
       navBar.appendChild(ns);
    }
    ns = document.createElement('span');
    ns.className="navArrow";
    sShow.addEvent(ns, 'click', sShow.changeRight, false);
    ns.appendChild(document.createTextNode("[next]"));
    navBar.appendChild(ns);

    sShow.updateContent(myImages);
  },

  /*
    handles left (37) and right (39) arrow keys.
  */
  checkKeyPressed: function (evt)
  {
    evt = (evt) ? evt : (window.event) ? event : null;
    if (evt)
    {
      var charCode = (evt.charCode) ? evt.charCode :
                     ((evt.keyCode) ? evt.keyCode :
                     ((evt.which) ? evt.which : 0));

      if (charCode == 39)
      {
         sShow.changeSlide(1, pictures);
         return false;
      }
      if(charCode == 37)
      {
         sShow.changeSlide(-1, pictures);
         return false;
      }
    }
    return true;
  }
};

// Finally, bind the above functions to the onload & onunload events of the page
sShow.addEvent(window, 'load', sShow.startSlide, false);
//sShow.addEvent(window, 'unload', EventCache.flush, false);

// End of file

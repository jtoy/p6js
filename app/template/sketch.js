  function setup(){
t=0
  }

  function draw(){

  x= noise(t)*width
ellipse(x,20,30,30)
t+=0.01
  }

import * as THREE from 'three';import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
// Original, code-generated looping "movie": drifting gradient sky, sun, rolling hills, plus a test strip.
export function makeScreenCanvas(){const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 function draw(t){const W=c.width,H=c.height,k=(Math.sin(t*0.15)+1)/2;const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,`hsl(${230-40*k},60%,${18+20*k}%)`);sky.addColorStop(0.65,`hsl(${20+15*k},85%,${50+10*k}%)`);sky.addColorStop(1,'#20102a');g.fillStyle=sky;g.fillRect(0,0,W,H);
  g.fillStyle=`rgba(255,${200+40*k},150,.95)`;g.beginPath();g.arc(W*0.5+Math.sin(t*0.2)*80,H*(0.62-0.15*k),36,0,7);g.fill();
  for(let L=0;L<3;L++){g.fillStyle=['#3a2350','#2a1838','#170d20'][L];g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=8)g.lineTo(x,H*(0.62+L*0.1)+Math.sin(x/(90-L*20)+t*(0.3+L*0.25))*14);g.lineTo(W,H);g.fill();}
  const bars=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0'];for(let i=0;i<7;i++){g.fillStyle=bars[i];g.fillRect(W-150+i*20,12,20,10);}
  g.fillStyle='#fff8';g.font='14px system-ui';g.fillText('MOVIE MODE',14,26);tex.needsUpdate=true;}
 return {canvas:c,tex,draw};}
export function screenSize(diagIn,ar){const r=ar==='2.35'?2.35:16/9,d=diagIn*0.0254,h=d/Math.sqrt(1+r*r);return {w:h*r,h};}
export function setupMovie({S,B,hemi,dl,U}){RectAreaLightUniformsLib.init();
 const sc=makeScreenCanvas();const screen=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:sc.tex,toneMapped:false}));screen.visible=false;S.add(screen);
 const cone=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({color:0xfff2d8,transparent:true,opacity:0.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));cone.geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(36),3));cone.visible=false;cone.frustumCulled=false;S.add(cone);
 const ral=new THREE.RectAreaLight(0xffe8d0,0,1,1);S.add(ral);
 const st={on:false,light:1,size:120,ar:'16:9',y:0.6};let last=0;
 function apply(){const {w,h}=screenSize(st.size,st.ar);const z=B.z0+0.04;screen.scale.set(w,h,1);screen.position.set(0,st.y+h/2,z);screen.visible=st.on;
  ral.width=w;ral.height=h;ral.position.copy(screen.position);ral.position.z+=0.05;ral.lookAt(0,screen.position.y,0);ral.intensity=st.on?6:0;
  const L=st.on?st.light:1;hemi.intensity=1.6*Math.max(L,0.02);dl.intensity=1.2*L;U.uDim.value=st.on?0.08+0.92*L:1;return {w,h};}
 function tick(t,projector){if(!st.on){cone.visible=false;return;}if(t-last>0.033){sc.draw(t);last=t;}
  if(!projector){cone.visible=false;return;}const lens=new THREE.Vector3(0.08,0.34,-0.2).applyMatrix4(projector.matrixWorld);
  const {w,h}=screenSize(st.size,st.ar),cx=screen.position.x,cy=screen.position.y,z=screen.position.z+0.01;const C=[[cx-w/2,cy-h/2],[cx+w/2,cy-h/2],[cx+w/2,cy+h/2],[cx-w/2,cy+h/2]];
  const a=cone.geometry.attributes.position.array;for(let i=0;i<4;i++){const p=C[i],q=C[(i+1)%4];a.set([lens.x,lens.y,lens.z,p[0],p[1],z,q[0],q[1],z],i*9);}cone.geometry.attributes.position.needsUpdate=true;cone.visible=true;}
 return {st,apply,tick,screen};}

import * as THREE from 'three';
// Procedural, original floor textures drawn on canvas. size = meters covered by one tile of the texture.
function cnv(n=512){const c=document.createElement('canvas');c.width=c.height=n;return [c,c.getContext('2d')];}
const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(42);
function noise(g,n,a,base){const im=g.getImageData(0,0,n,n),d=im.data;for(let i=0;i<d.length;i+=4){const v=(rnd()-0.5)*a;d[i]+=v;d[i+1]+=v;d[i+2]+=v;}g.putImageData(im,0,0);}
function planks(g,n,rows,cols,base,var_,grain,gap){const h=n/rows;for(let r=0;r<rows;r++){const off=(r*0.37%1)*n;for(let k=-1;k<cols;k++){const x=off+k*n/cols;const c=base.map(v=>v+(rnd()-0.5)*var_);g.fillStyle=`rgb(${c})`;g.fillRect(((x%n)+n)%n,r*h,n/cols,h);if(((x%n)+n)%n+n/cols>n)g.fillRect(((x%n)+n)%n-n,r*h,n/cols,h);}
 for(let i=0;i<grain;i++){g.strokeStyle=`rgba(0,0,0,${0.03+rnd()*0.06})`;g.lineWidth=1+rnd()*1.5;const y=r*h+rnd()*h;g.beginPath();g.moveTo(0,y);for(let x=0;x<=n;x+=32)g.lineTo(x,y+Math.sin(x/40+i)*2);g.stroke();}
 g.fillStyle=gap;g.fillRect(0,r*h,n,2);}}
export const FLOORS={
 scan:{name:'Original scan'},
 carpet:{name:'Carpet',size:1,draw(g,n){g.fillStyle='#8c8072';g.fillRect(0,0,n,n);noise(g,n,46);}},
 hardwood:{name:'Hardwood',size:1.2,draw(g,n){planks(g,n,9,3,[150,98,58],40,10,'rgba(40,20,10,.6)');}},
 lvp:{name:'LVP',size:1.8,draw(g,n){planks(g,n,7,2,[176,160,138],22,6,'rgba(60,50,40,.45)');}},
 tile:{name:'Tile',size:1.2192,draw(g,n){const t=n/4;for(let i=0;i<4;i++)for(let j=0;j<4;j++){const v=212+(rnd()-0.5)*14;g.fillStyle=`rgb(${v},${v-3},${v-8})`;g.fillRect(i*t,j*t,t,t);}noise(g,n,10);g.fillStyle='#8f8a84';for(let i=0;i<=4;i++){g.fillRect(i*t-2,0,4,n);g.fillRect(0,i*t-2,n,4);}}},
 concrete:{name:'Concrete',size:2.5,draw(g,n){g.fillStyle='#9a9894';g.fillRect(0,0,n,n);for(let i=0;i<60;i++){g.fillStyle=`rgba(${rnd()<.5?0:255},${rnd()<.5?0:255},${rnd()<.5?0:255},0)`;const v=rnd()<.5?60:200;g.fillStyle=`rgba(${v},${v},${v},.06)`;g.beginPath();g.arc(rnd()*n,rnd()*n,20+rnd()*80,0,7);g.fill();}noise(g,n,24);}},
};
export const SWATCHES=[['Original',null],['Warm white','#f2ede3'],['Greige','#cfc6b8'],['Sage','#a9b8a0'],['Sky','#a9c2d6'],['Navy','#2f3f5c'],['Terracotta','#c27a5a'],['Charcoal','#4a4c50']];
const cache={};function floorTex(id){if(cache[id])return cache[id];const [c,g]=cnv();FLOORS[id].draw(g,512);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return cache[id]=t;}
export const U={uFloorOn:{value:0},uFloorMap:{value:null},uFloorScale:{value:1},uWallOn:{value:0},uWallColor:{value:new THREE.Color()},uHide:{value:1},uMask:{value:null}};
export const MASK={x0:-4.3,z0:-3.1,w:8.8,d:6.4,margin:0.35};
// Patch the scan material: faces facing up near y=0 = floor; near-vertical faces above the floor = walls.
export function patchRoom(mat){mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;uniform float uFloorOn,uFloorScale,uWallOn;uniform sampler2D uFloorMap;uniform vec3 uWallColor;uniform float uHide;uniform sampler2D uMask;')
 .replace('#include <map_fragment>',`#include <map_fragment>
 if(uHide>0.5 && (vWP.y>0.03 || (max(max(diffuseColor.r,diffuseColor.g),diffuseColor.b)-min(min(diffuseColor.r,diffuseColor.g),diffuseColor.b))>0.12) && vWP.x>-3.95 && vWP.x<3.95 && vWP.z>-2.75 && vWP.z<2.75 && texture2D(uMask,vec2((vWP.x+4.3)/8.8,(vWP.z+3.1)/6.4)).r>0.5) discard;
 {vec3 n=normalize(vWN);float lum=dot(diffuseColor.rgb,vec3(.299,.587,.114));
  if(uFloorOn>0.5 && vWP.y<0.25 && abs(n.y)>0.75){vec3 t=texture2D(uFloorMap,vWP.xz/uFloorScale).rgb;diffuseColor.rgb=t*clamp(lum/0.42,0.55,1.25);}
  else if(uWallOn>0.5 && abs(n.y)<0.45 && vWP.y>0.08){diffuseColor.rgb=uWallColor*clamp(lum/0.55,0.35,1.2);}}`);};
 mat.customProgramCacheKey=()=>'roompaint';mat.needsUpdate=true;}
export function applyPaint(p){p=p||{};const f=p.f&&FLOORS[p.f]&&p.f!=='scan'?p.f:null;U.uFloorOn.value=f?1:0;if(f){U.uFloorMap.value=floorTex(f);U.uFloorScale.value=FLOORS[f].size;}
 U.uWallOn.value=p.w?1:0;if(p.w)U.uWallColor.value.set(p.w).convertSRGBToLinear();}

export function loadMask(url){return new Promise(ok=>{const img=new Image();img.onload=()=>{const t=new THREE.Texture(img);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false;t.needsUpdate=true;U.uMask.value=t;
 const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,img.width,img.height).data;
 MASK.test=(x,z)=>{const i=Math.floor((x-MASK.x0)/MASK.w*img.width),j=Math.floor((z-MASK.z0)/MASK.d*img.height);if(i<0||j<0||i>=img.width||j>=img.height)return false;if(x<-3.95||x>3.95||z<-2.75||z>2.75)return false;return d[(j*img.width+i)*4]>127;};ok();};img.src=url;});}

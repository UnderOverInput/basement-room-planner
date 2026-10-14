// Top-down floor plan renderer (2D canvas). Returns a canvas.
const ft=m=>{const i=Math.round(m*39.3701);return `${Math.floor(i/12)}′${i%12}″`;};
export function renderPlan({B,wallPts,items,cat,title='Room Floor Plan',paint,screen}){
 const W=2200,H=1600,mg=170,sx=(W-2*mg)/(B.x1-B.x0),sz=(H-2*mg-80)/(B.z1-B.z0),s=Math.min(sx,sz);
 const ox=W/2-(B.x0+B.x1)/2*s,oz=(H+60)/2-(B.z0+B.z1)/2*s,P=(x,z)=>[ox+x*s,oz+z*s];
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#111';g.font='bold 44px system-ui,sans-serif';g.fillText(title,mg,80);
 g.font='26px system-ui,sans-serif';g.fillStyle='#555';g.fillText(`${ft(B.x1-B.x0)} × ${ft(B.z1-B.z0)} · ceiling ${ft(B.ceil)}`+(paint?.w?` · walls ${paint.w}`:'')+(paint?.f&&paint.f!=='scan'?` · floor: ${paint.f}`:''),mg,122);
 // floor
 const [a,b]=P(B.x0,B.z0),[c2,d]=P(B.x1,B.z1);g.fillStyle='#f4f1ea';g.fillRect(a,b,c2-a,d-b);
 // light grid every foot
 g.strokeStyle='#e4e0d8';g.lineWidth=1;for(let x=B.x0;x<=B.x1;x+=0.3048){g.beginPath();g.moveTo(...P(x,B.z0));g.lineTo(...P(x,B.z1));g.stroke();}for(let z=B.z0;z<=B.z1;z+=0.3048){g.beginPath();g.moveTo(...P(B.x0,z));g.lineTo(...P(B.x1,z));g.stroke();}
 // scanned walls as dense points
 g.fillStyle='#2a2a2a';for(let i=0;i<wallPts.length;i+=2){const [x,y]=P(wallPts[i],wallPts[i+1]);g.fillRect(x-1.5,y-1.5,3,3);}
 g.strokeStyle='#111';g.lineWidth=5;g.strokeRect(a,b,c2-a,d-b);
 // dimensions
 g.strokeStyle='#333';g.fillStyle='#111';g.lineWidth=2;g.font='bold 30px system-ui,sans-serif';g.textAlign='center';
 const dim=(x1,y1,x2,y2,t,vert)=>{g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();for(const [x,y] of[[x1,y1],[x2,y2]]){g.beginPath();vert?(g.moveTo(x-12,y),g.lineTo(x+12,y)):(g.moveTo(x,y-12),g.lineTo(x,y+12));g.stroke();}
  g.save();g.translate((x1+x2)/2,(y1+y2)/2);if(vert)g.rotate(-Math.PI/2);g.fillStyle='#fff';const w=g.measureText(t).width+16;g.fillRect(-w/2,-20,w,40);g.fillStyle='#111';g.fillText(t,0,10);g.restore();};
 dim(a,d+55,c2,d+55,ft(B.x1-B.x0));dim(a-55,b,a-55,d,ft(B.z1-B.z0),true);
 // furniture
 for(const it of items){const c=cat(it.i);if(!c)continue;const [x,y]=P(it.x,it.z);g.save();g.translate(x,y);g.rotate(-(it.r||0)*Math.PI/180);
  g.fillStyle=(it.c||'#7d8ea3')+'55';g.strokeStyle='#1f3b66';g.lineWidth=3;g.fillRect(-c.dims.w*s/2,-c.dims.d*s/2,c.dims.w*s,c.dims.d*s);g.strokeRect(-c.dims.w*s/2,-c.dims.d*s/2,c.dims.w*s,c.dims.d*s);
  g.beginPath();g.moveTo(-c.dims.w*s/2+6,c.dims.d*s/2-6);g.lineTo(c.dims.w*s/2-6,c.dims.d*s/2-6);g.strokeStyle='#1f3b6688';g.stroke();g.restore();
  const fs=Math.max(16,Math.min(26,c.dims.w*s/7));g.font=`bold ${fs}px system-ui,sans-serif`;g.fillStyle='#0d1b33';g.fillText(c.name,x,y-2);g.font=`${fs*0.85}px system-ui,sans-serif`;g.fillStyle='#334';g.fillText(`${ft(c.dims.w)} × ${ft(c.dims.d)}`,x,y+fs);}
 // scale bar 5 ft
 g.textAlign='left';const L=5*0.3048*s,bx=W-mg-L,by=H-60;g.fillStyle='#111';for(let i=0;i<5;i++){g.fillStyle=i%2?'#fff':'#111';g.fillRect(bx+i*L/5,by,L/5,14);}g.strokeStyle='#111';g.strokeRect(bx,by,L,14);g.fillStyle='#111';g.font='24px system-ui,sans-serif';g.fillText('0',bx-6,by-10);g.fillText('5 ft',bx+L-20,by-10);
 if(screen){const [p1x,py]=P(screen.x-screen.w/2,B.z0),[p2x]=P(screen.x+screen.w/2,B.z0);g.strokeStyle='#d0332d';g.lineWidth=12;g.beginPath();g.moveTo(p1x,py+8);g.lineTo(p2x,py+8);g.stroke();g.fillStyle='#d0332d';g.font='bold 24px system-ui,sans-serif';g.textAlign='center';g.fillText(`Screen ${screen.label}`,(p1x+p2x)/2,py+44);g.textAlign='left';}
 // north arrow
 const nx=W-mg+60,ny=110;g.fillStyle='#c33';g.beginPath();g.moveTo(nx,ny-55);g.lineTo(nx+22,ny+15);g.lineTo(nx,ny);g.lineTo(nx-22,ny+15);g.closePath();g.fill();g.fillStyle='#111';g.font='bold 34px system-ui,sans-serif';g.textAlign='center';g.fillText('N',nx,ny+55);
 g.textAlign='left';g.font='20px system-ui,sans-serif';g.fillStyle='#888';g.fillText('Generated with Room Planner · furniture sizes approximate · scan from Polycam',mg,H-30);
 return c;}

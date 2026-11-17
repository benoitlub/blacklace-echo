import type { DrinkId } from "./drinks";
// WebGL liquid/chromatic deformation of the real decor (phase 25–45 s).
const VS = `attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;
const FS = `precision mediump float;varying vec2 uv;uniform sampler2D tex;uniform float t,w;uniform int v;uniform vec3 tint;
vec2 swirl(vec2 q,vec2 c,float r,float a){vec2 d=q-c;d.x*=1.777;float k=exp(-dot(d,d)/r);float an=a*k;float s=sin(an),co=cos(an);d=mat2(co,-s,s,co)*d;d.x/=1.777;return c+d;}
void main(){vec2 q=uv;
q=swirl(q,vec2(.646,.166),.006,w*2.2*sin(t*.4));q=swirl(q,vec2(.75,.096),.005,-w*1.8);q=swirl(q,vec2(.063,.9),.012,w*2.6*sin(t*.3+1.));q=swirl(q,vec2(.393,.75),.004,w*2.);
if(v==0){q+=w*.012*vec2(sin(q.y*28.+t*1.4),cos(q.x*22.+t*1.1));}
else if(v==1){q.x+=w*.022*sin(q.y*11.+t*1.3);q.y+=w*.014*sin(q.x*8.+t*.9);}
else if(v==2){for(int i=0;i<4;i++){float fi=float(i);vec2 c=vec2(fract(.2+fi*.27),fract(1.-t*.03-fi*.31));vec2 d=q-c;d.x*=1.777;float l=length(d);q-=d*w*.35*smoothstep(.12,.0,l)/vec2(1.777,1.);}}
else if(v==3){vec2 c=vec2(.895,.17);vec2 d=q-c;d.x*=1.777;float l=length(d);float beat=fract(t*1.6);q+=normalize(d+1e-4)/vec2(1.777,1.)*w*.012*sin(l*42.-beat*6.283);}
else{float a=w*.06*sin(t*.5);vec2 c=q-.5;q=.5+mat2(cos(a),-sin(a),sin(a),cos(a))*c;}
float ab=w*(v==1?.008:.005);
vec3 col=vec3(texture2D(tex,q+vec2(ab,0.)).r,texture2D(tex,q).g,texture2D(tex,q-vec2(ab,0.)).b);
if(v==4){vec3 g=texture2D(tex,q+vec2(.045*w*sin(t*.7),.01*w)).rgb;col=mix(col,g.bgr,.38*w);}
col=mix(col,col*tint*1.5,.35*w);gl_FragColor=vec4(col,1.);}`;
const VARIANT: Record<DrinkId, number> = { violette: 0, moscomiul: 1, kombuchee: 2, strawberry: 3, reboot: 4 };
export class Warp {
  private gl: WebGLRenderingContext; private u: Record<string, WebGLUniformLocation | null> = {}; ready = false;
  static create(canvas: HTMLCanvasElement, img: HTMLImageElement) { try { const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false }); return gl ? new Warp(gl, img) : null; } catch { return null; } }
  private constructor(gl: WebGLRenderingContext, img: HTMLImageElement) {
    this.gl = gl;
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return; gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["t", "w", "v", "tint"]) this.u[n] = gl.getUniformLocation(pr, n);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    for (const [k, val] of [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]) gl.texParameteri(gl.TEXTURE_2D, k, val);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); this.ready = true;
  }
  render(t: number, w: number, id: DrinkId, tint: string) {
    if (!this.ready) return; const gl = this.gl, c = gl.canvas as HTMLCanvasElement;
    gl.viewport(0, 0, c.width, c.height);
    const n = parseInt(tint.slice(1), 16);
    gl.uniform1f(this.u.t, t); gl.uniform1f(this.u.w, w); gl.uniform1i(this.u.v, VARIANT[id]);
    gl.uniform3f(this.u.tint, ((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}


/**
 * The functions in this file create models in an
 * IFS format that can be drawn using gl.drawElements
 * with primitive type gl.TRIANGLES.  Objects have
 * vertex coordinates, normal vectors, and texture
 * coordinates for each vertex, plus a list of indicies
 * for the element array buffer.  The return value
 * of each function is an object, model, with properties:
 * 
 *    model.vertexPositions -- the vertex coordinates;
 *    model.vertexNormals -- the normal vectors;
 *    model.vertexTextureCoords -- the texture coordinates;
 *    model.indices -- the face indices.
 *
 * The first three properties are of type Float32Array, while
 * model.indicesis of type Uint16Array.
 *
 */

 
 /**
  * Create a model of a cube, centered at the origin.  (This is not
  * a particularly good format for a cube, since an IFS representation
  * has a lot of redundancy.)
  * @side the length of a side of the cube.  If not given, the value will be 1.
  */
function cube(side) {
   var s = (side || 1)/2;
   var coords = [];
   var normals = [];
   var texCoords = [];
   var indices = [];
   function face(xyz, nrm) {
      var start = coords.length/3;
      var i;
      for (i = 0; i < 12; i++) {
         coords.push(xyz[i]);
      }
      for (i = 0; i < 4; i++) {
         normals.push(nrm[0],nrm[1],nrm[2]);
      }
      texCoords.push(0,0,1,0,1,1,0,1);
      indices.push(start,start+1,start+2,start,start+2,start+3);
   }
   face( [-s,-s,s, s,-s,s, s,s,s, -s,s,s], [0,0,1] );
   face( [-s,-s,-s, -s,s,-s, s,s,-s, s,-s,-s], [0,0,-1] );
   face( [-s,s,-s, -s,s,s, s,s,s, s,s,-s], [0,1,0] );
   face( [-s,-s,-s, s,-s,-s, s,-s,s, -s,-s,s], [0,-1,0] );
   face( [s,-s,-s, s,s,-s, s,s,s, s,-s,s], [1,0,0] );
   face( [-s,-s,-s, -s,-s,s, -s,s,s, -s,s,-s], [-1,0,0] );
   return {
      vertexPositions: new Float32Array(coords),
      vertexNormals: new Float32Array(normals),
      vertexTextureCoords: new Float32Array(texCoords),
      indices: new Uint16Array(indices)
   }
}




/**
 * Create a model of a torus (surface of a doughnut).  The z-axis goes through the doughnut hole,
 * and the center of the torus is at (0,0,0).
 * @param outerRadius the distance from the center to the outside of the tube, 0.5 if not specified.
 * @param innerRadius the distance from the center to the inside of the tube, outerRadius/3 if not
 *    specified.  (This is the radius of the doughnut hole.)
 * @param slices the number of lines of longitude, default 32.  These are slices parallel to the
 * z-axis and go around the tube the short way (through the hole).
 * @param stacks the number of lines of latitude plus 1, default 16.  These lines are perpendicular
 * to the z-axis and go around the tube the long way (arouind the hole).
 */
function uvTorus(outerRadius, innerRadius, slices, stacks) {
   outerRadius = outerRadius || 0.5;
   innerRadius = innerRadius || outerRadius/3;
   slices = slices || 32;
   stacks = stacks || 16;
   var vertexCount = (slices+1)*(stacks+1);
   var vertices = new Float32Array( 3*vertexCount );
   var normals = new Float32Array( 3* vertexCount );
   var texCoords = new Float32Array( 2*vertexCount );
   var indices = new Uint16Array( 2*slices*stacks*3 );
   var du = 2*Math.PI/slices;
   var dv = 2*Math.PI/stacks;
   var centerRadius = (innerRadius+outerRadius)/2;
   var tubeRadius = outerRadius - centerRadius;
   var i,j,u,v,cx,cy,sin,cos,x,y,z;
   var indexV = 0;
   var indexT = 0;
   for (j = 0; j <= stacks; j++) {
      v = -Math.PI + j*dv;
      cos = Math.cos(v);
      sin = Math.sin(v);
      for (i = 0; i <= slices; i++) {
         u = i*du;
         cx = Math.cos(u);
         cy = Math.sin(u);
         x = cx*(centerRadius + tubeRadius*cos);
         y = cy*(centerRadius + tubeRadius*cos);
         z = sin*tubeRadius;
         vertices[indexV] = x;
         normals[indexV++] = cx*cos;
         vertices[indexV] = y
         normals[indexV++] = cy*cos;
         vertices[indexV] = z
         normals[indexV++] = sin;
         texCoords[indexT++] = i/slices;
         texCoords[indexT++] = j/stacks;
      } 
   }
   var k = 0;
   for (j = 0; j < stacks; j++) {
      var row1 = j*(slices+1);
      var row2 = (j+1)*(slices+1);
      for (i = 0; i < slices; i++) {
          indices[k++] = row1 + i;
          indices[k++] = row2 + i + 1;
          indices[k++] = row2 + i;
          indices[k++] = row1 + i;
          indices[k++] = row1 + i + 1;
          indices[k++] = row2 + i + 1;
      }
   }
   return {
       vertexPositions: vertices,
       vertexNormals: normals,
       vertexTextureCoords: texCoords,
       indices: indices
   };
}



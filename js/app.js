
const container = document.body
const tooltip = document.querySelector('.tooltip')
let spriteActive = false

class Scene{
  constructor (image, camera) {
    this.image = image
    this.points = []
    this.sprites = []
    this.scene = null
    this.sphere = null
    this.camera = camera
  }
  
  createScene (scene) {
    console.log(this.image)
    this.scene = scene
    const texture = new THREE.TextureLoader().load(this.image) // 'assets/images/360.jpg'
    texture.wrapS = THREE.RepeatWrapping 
    texture.repeat.x = -1
    
    const geometry = new THREE.SphereGeometry(50, 32, 32)
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide
    })
    material.transparent = true
    this.sphere = new THREE.Mesh(geometry, material)
    this.scene.add(this.sphere)
    this.points.forEach(this.addTooltip.bind(this))

  }

  addPoint (point) {
    this.points.push(point)
  }

  // Tooltip
  // ---------------------------------
  addTooltip (point) {
    let spriteMap = new THREE.TextureLoader().load('assets/images/info2.png')
    let spriteMaterial = new THREE.SpriteMaterial({
      map: spriteMap
    })
    spriteMaterial.transparent = true
    let sprite = new THREE.Sprite(spriteMaterial)
    //decalage à x = 35
    sprite.position.copy(point.position.clone().normalize().multiplyScalar(35))
    sprite.name = point.name
    sprite.scale.multiplyScalar(2)
    this.scene.add(sprite)
    this.sprites.push(sprite)
    const magic = function () { console.log('this is magic') }
    sprite.onClick = () => {
      this.destroy(magic)
      point.scene.createScene(this.scene)
      point.scene.appear()
    }
  }

  appear () {
    // appear the sphere
  

    this.sphere.material.opacity = 0
    TweenLite.to(this.sphere.material, 0.9, {
      opacity: 1
    })

    // appear all sprites
    this.sprites.forEach((sprite) => {
      sprite.scale.set(0, 0, 0)
      TweenLite.to(sprite.scale, 0.9, {
        x: 2,
        y: 2,
        z: 2
      })
    })
  }  

  destroy (magic) {
    TweenLite.to(this.camera, 1, {
      zoom: 2,
      onUpdate: () => {
        this.camera.updateProjectionMatrix()
      },
      onComplete: () => {
        this.camera.zoom = 1
        this.camera.updateProjectionMatrix()
        magic()
      }
    })

    // remove sphere
    TweenLite.to(this.sphere.material, 0.9, {
      opacity: 0.1,
      onComplete: () => {
        this.scene.remove(this.sphere)
      }
    })

    // remove all sprites
    this.sprites.forEach((sprite) => {
      TweenLite.to(sprite.scale, 0.9, {
        x: 0,
        y: 0,
        z: 0,
        onComplete: () => {
        this.scene.remove(sprite)
        }
      })
    })
  }  
}

// Scene & controls MAIN proc
// ------------------------------------------
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(-1, 0, 0)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
container.appendChild(renderer.domElement)

const controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.rotateSpeed = 0.2
controls.enableZoom = false
controls.update()

// Sphere
// ----------------------------------------------
let s1 = new Scene('assets/images/360.jpg', camera)
let s2 = new Scene('assets/images/3602.jpg', camera)
let s3 = new Scene('assets/images/3603.jpg', camera)

s1.addPoint({
  position: new THREE.Vector3(43.91206301426611, 2.097013336329365, 23.18584556771714),
  name: 'exit1',
  scene: s2
})

s1.addPoint({
  position: new THREE.Vector3(13.62710684571287,  3.0895211109733314,  -47.70668196849295),
  name: 'exit2',
  scene: s3
})


s2.addPoint({
  position: new THREE.Vector3(43.91206301426611, 2.097013336329365, 23.18584556771714),
  name: 'exit1',
  scene: s1
})

s2.addPoint({
  position: new THREE.Vector3(13.62710684571287,  3.0895211109733314,  -47.70668196849295),
  name: 'exit2',
  scene: s1
})
s3.addPoint({
  position: new THREE.Vector3(13.62710684571287,  3.0895211109733314,  -47.70668196849295),
  name: 'exit2',
  scene: s1
})

s1.createScene(scene)
// s1.appear()



// rendu
// ----------------------------------

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera)
}
animate()

function onResize () {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

const rayCaster = new THREE.Raycaster()

function onClick (e) {
  let mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth ) * 2 - 1,
    -(e.clientY / window.innerHeight ) * 2 + 1
  )

  rayCaster.setFromCamera(mouse, camera)
  
  let intersects = rayCaster.intersectObjects(scene.children)
  intersects.forEach(function (intersect) {
    if (intersect.object.type === 'Sprite') {

      intersect.object.onClick()
      // let p = intersect.object.position.clone().project(camera) // project = -1 -> 1
        const sin = intersect.point.x
        const cos = intersect.point.z
        
        // camera.lookAt(intersect.point)
        // camera.translateZ(-20)
    }
  })

 /*
  intersects = rayCaster.intersectObject(sphere)
  if (intersects.length > 0) {
    addTooltip(intersects[0].point)
  }
 */
}

function onMouseMove (e) {

  let mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth ) * 2 - 1,
    -(e.clientY / window.innerHeight ) * 2 + 1
  )

  rayCaster.setFromCamera(mouse, camera)
  let foundSprite = false
  let intersects = rayCaster.intersectObjects(scene.children)
  intersects.forEach(function (intersect) {
    if (intersect.object.type === 'Sprite') {

      let p = intersect.object.position.clone().project(camera) // project = -1 -> 1
      tooltip.style.top = ((-p.y + 1) * window.innerHeight / 2) + 'px'
      tooltip.style.left = ((p.x + 1) * window.innerWidth / 2) + 'px'
      tooltip.innerHTML = intersect.object.name
      tooltip.classList.add('is-active')
      spriteActive = intersect.object
      foundSprite = true
    }
  })
  if (foundSprite === false && spriteActive) {
    tooltip.classList.remove('is-active')
    tooltipActive = false
  }
}


// addTooltip(new THREE.Vector3(43.91206301426611, 2.097013336329365, 23.18584556771714),'exit1')
// addTooltip(new THREE.Vector3( 13.62710684571287,  3.0895211109733314,  -47.70668196849295,'exit2'))

window.addEventListener('resize', onResize)
container.addEventListener('click', onClick)
container.addEventListener('mousemove', onMouseMove)


const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y 

        this.radius = radius
        this.color = color 
    }
    draw() {
        c.beginPath() 
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    //when clock on the screen shoot projectile 
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

//in case we have multiple instances we want to create new class
//enemy is something which goes from outside of the screen in the middle 
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    //when clock on the screen shoot projectile 
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
 // treba fixnut 1:20 
 const friction = 0.99 //spomalenie guliciek po vybuchu
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha  
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction//spomalenie guliciek po vybuchu
        this.velocity.y *= friction//spomalenie guliciek po vybuchu
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.aplha -= 0.01
    }
}

// ball is in the middle 
const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 15, 'white')

const projectiles = []

const enemies = []

const particles = [] // treba fixnut


function spawnEnemies() {
    setInterval(() => {
        //velkost gulicky
        const radius = Math.random() * (30 - 7) + 7 //aby sme dostali velkost medzi 4 - 30, 4 je a menej je velmi malo
        let x 
        let y
        //spawn guliciek, 50/50 sanca z ktorej strany pojdu
        if(Math.random() < 0.5) {
             x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
             y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)` // generovnaie random farieb pre enemy gulicky

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x) // core for shooting balls

        const velocity = {
        x: Math.cos(angle), y: Math.sin(angle) // rychlost enemies
    }
        enemies.push(new Enemy(x, y, radius, color, velocity))
        //console.log(enemies)
    }, 1000)
}

let animationId
let score = 0
function animate() {
   animationId = requestAnimationFrame(animate)
   c.fillStyle = 'rgba(0, 0, 0, 0.1)' //tiene za prijektilmi a nepriatelmi
    c.fillRect(0, 0, canvas.width, canvas.height) //shooting balls
    player.draw()
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update()
        //zmazanie projektilov z rohov a okrajov
        if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    }) 
    enemies.forEach((enemy, index) => { // call enemies
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        if(dist - enemy.radius - player.radius < 1) { 
            cancelAnimationFrame(animationId) // ked sa nas dotkne projektil hra skoncila
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)// vzdialenost medzi dvoma objektami
            //ked projektil trafi enemy
            if(dist - enemy.radius - projectile.radius < 1) {
               
                //vytvorenie vybuchu
                for(let i = 0; i < enemy.radius * 2; i++) {
                     // treba fixnut, 1:20 
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 8) , y: (Math.random - 0.5) * (Math.random() * 8)}))
                }

                if(enemy.radius  - 10 > 5) {
                     //zvysenie score
                    score += 10
                    scoreEl.innerHTML = score
                    gsap.to(enemy, { //gsap greensock kniznica pre animacie, ked projektil trafi enemy 
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }else {
                     //zvysenie score
                    score += 25
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        });
    })
}

//after clicking do action, this event knows exactly when my mouse was 
addEventListener('click', (event) =>
     {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2) // core for shooting balls
    const velocity = {
        x: Math.cos(angle) * 6, y: Math.sin(angle) * 6 // rychlost projektilu
    }
    //console.log(angle);
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
    )
})
//start button
startGameBtn.addEventListener('click', () => {
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
})
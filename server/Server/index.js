import Express from 'express'
import http from 'http'
import SockJs from 'sockjs'
import StepManager from '../Steps/StepManager'
import WriteToLog from '../utils/WriteToLog'

const PORT = 8080

export default class Server {
  constructor () {
    this.app = Express()
    this.app.use(Express.static('build/public'))

    this.setMainRoutes()
    this.createServer()
    this.listenAuthentification()

    StepManager.defineExperiences()
  }

  createServer () {
    this.server = http.createServer(this.app)
    this.io = SockJs.createServer({
      sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
    })
    this.io.installHandlers(this.server, {
      prefix: '/ws'
    })
  }

  setMainRoutes () {
    this.app.get('/', (req, res) => {
      res.sendFile('index.html')
    })
  }

  listenAuthentification () {
    this.io.on('connection', (socket) => {
      socket.on('data', (datas) => {
        const data = JSON.parse(datas)

        if (data['type'] === 'auth') {
          const device = data['device']
          switch (device) {
            case 'client':
              WriteToLog.setSocket(socket)
              break
            default:
              const experience = StepManager.getStepByName(device)
              if (experience) {
                WriteToLog.write(`Set socket on ${experience.name} experience`)
                experience.setSocket(socket)
              }
          }
        }
      })
    })
  }

  start () {
    this.server.listen(PORT, '0.0.0.0')
  }
}

import './init'
import connect from './init/connections'
import server from './init/server'

connect().then(server)
    .then(() => {
        Log.info('Start!')
    }).catch((err: Error) => {
        Log.error({err}, 'Server didn\'t start, something went wrong 💔')
        setTimeout(process.exit, 1000, 1)
    })

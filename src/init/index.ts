import dotenv from 'dotenv-safe'
import moduleAlias from 'module-alias'
import path from 'path'
import 'reflect-metadata'

const cwd = process.cwd()
if (process.env.NODE_ENV === 'test') {
    dotenv.config({path: path.resolve(cwd, '.env.test')})
}
dotenv.config({path: path.resolve(cwd, '.env')})

// -----aliases------
const startDir = __dirname + '/..'
const aliases = {
    '@src': startDir,
    '@config': startDir + '/config',
    '@modules': startDir + '/modules'
}

moduleAlias.addAliases(aliases)
moduleAlias.addPath(startDir)

import {globalInit} from '@bibtrip/infra'
globalInit()

import '@src/inversify.cfg'

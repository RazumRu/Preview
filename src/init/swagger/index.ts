import {SECURITY, TAGS} from '@config/swagger'
import {SwaggerCollection} from '@bibtrip/server'

// TAGS
SwaggerCollection.addTag(TAGS.PROFILE, 'Profiles')

// SECURITY
SwaggerCollection.addSecurity(SECURITY.BEARER, {
    type: 'apiKey',
    name: 'Authorization',
    in: 'header',
})

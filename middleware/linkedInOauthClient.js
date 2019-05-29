require('dotenv').config({
    path: '../config/.env'
});
const request = require('request-promise-native');

const getEmail = async (bearerToken) => {
    return await request.get('https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))', {
        'auth': {
            'bearer': bearerToken
        }
    });
};

const getProfile = async (bearerToken) => {
    return await request.get('https://api.linkedin.com/v2/me', {
        'auth': {
            'bearer': bearerToken
        }
    });
};

module.exports = {
    getEmail, getProfile
}





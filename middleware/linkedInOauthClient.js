require('dotenv').config({
    path: '../config/.env'
});
const request = require('request-promise-native');

const getEmail = async (bearerToken) => {
    let emailResponse =  await request.get('https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))', {
        'auth': {
            'bearer': bearerToken
        }
    });
    return JSON.parse(emailResponse).elements[0]["handle~"].emailAddress;
};

const getProfile = async (bearerToken) => {
    let profileResponse = await request.get('https://api.linkedin.com/v2/me', {
        'auth': {
            'bearer': bearerToken
        }
    });
    profileResponse = JSON.parse(profileResponse);
    return { 
        firstName: profileResponse.localizedFirstName,
        lastName: profileResponse.localizedLastName,
        linkedinId: profileResponse.id
    };
};

module.exports = {
    getEmail, getProfile
}





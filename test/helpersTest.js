const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '1'
  }, 
  "user2RandomID": {
    id: 'user2RandomID',
    email: 'user2example.com',
    password: '1'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with a valid email', function(){
    const user = getUserByEmail('user@example.com', testUsers)
    const expectedOutput = 'userRandomID';
    assert.equal(user.id, expectedOutput);
  });

  it('should not return a user with a valid email', function(){
    const user = getUserByEmail('user5@example.com', testUsers)
    const expectedOutput = 'userRandomID';
    assert.notEqual(user, expectedOutput);
  });
});
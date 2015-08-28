'use strict';

var app = require('..\..\app');
var request = require('supertest');

var newComment;

describe('Comment API:', function() {

  describe('GET /+', function() {
    var comments;

    beforeEach(function(done) {
      request(app)
        .get('/+')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          comments = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      comments.should.be.instanceOf(Array);
    });

  });

  describe('POST /+', function() {
    beforeEach(function(done) {
      request(app)
        .post('/+')
        .send({
          name: 'New Comment',
          info: 'This is the brand new comment!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newComment = res.body;
          done();
        });
    });

    it('should respond with the newly created comment', function() {
      newComment.name.should.equal('New Comment');
      newComment.info.should.equal('This is the brand new comment!!!');
    });

  });

  describe('GET /+/:id', function() {
    var comment;

    beforeEach(function(done) {
      request(app)
        .get('/+/' + newComment._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          comment = res.body;
          done();
        });
    });

    afterEach(function() {
      comment = {};
    });

    it('should respond with the requested comment', function() {
      comment.name.should.equal('New Comment');
      comment.info.should.equal('This is the brand new comment!!!');
    });

  });

  describe('PUT /+/:id', function() {
    var updatedComment

    beforeEach(function(done) {
      request(app)
        .put('/+/' + newComment._id)
        .send({
          name: 'Updated Comment',
          info: 'This is the updated comment!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedComment = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedComment = {};
    });

    it('should respond with the updated comment', function() {
      updatedComment.name.should.equal('Updated Comment');
      updatedComment.info.should.equal('This is the updated comment!!!');
    });

  });

  describe('DELETE /+/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/+/' + newComment._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when comment does not exist', function(done) {
      request(app)
        .delete('/+/' + newComment._id)
        .expect(404)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});

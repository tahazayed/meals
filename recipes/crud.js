// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('../config');

function getModel() {
	return require(`./model-${config.get('DATA_BACKEND')}`);
}

const router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({
		extended: false
	}));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
	res.set('Content-Type', 'text/html');
	next();
});

/**
 * GET /recipes/add
 *
 * Display a page of recipes (up to ten at a time).
 */
router.get('/', (req, res, next) => {
		getModel().list(10, req.query.pageToken, req.query.term, (err, entities, cursor, term) => {
			if (err) {
				next(err);
				return;
			}
			res.render('recipes/list.jade', {
				recipes: entities,
				nextPageToken: cursor,
				searchTerm: term
			});
		});
});

/**
 * GET /recipes/add
 *
 * Display a form for creating a recipe.
 */
// [START add_get]
router.get('/add', (req, res) => {
	res.render('recipes/form.jade', {
		recipe: {},
		action: 'Add'
	});
});
// [END add_get]

/**
 * POST /recipes/add
 *
 * Create a recipe.
 */
// [START add_post]
router.post('/add', (req, res, next) => {
	const data = req.body;

	// Save the data to the database.
	getModel().create(data, (err, savedData) => {
		if (err) {
			next(err);
			return;
		}
		res.redirect('${req.baseUrl}/${savedData.id}');
	});
});
// [END add_post]

/**
 * GET /recipes/:id/edit
 *
 * Display a recipe for editing.
 */
router.get('/:recipe/edit', (req, res, next) => {
	getModel().read(req.params.recipe, (err, entity) => {
		if (err) {
			next(err);
			return;
		}
		res.render('recipes/form.jade', {
			recipe: entity,
			action: 'Edit'
		});
	});
});

/**
 * POST /recipes/:id/edit
 *
 * Update a recipe.
 */
router.post('/:recipe/edit', (req, res, next) => {
	const data = req.body;

	getModel().update(req.params.recipe, data, (err, savedData) => {
		if (err) {
			next(err);
			return;
		}
		res.redirect('${req.baseUrl}/${savedData.id}');
	});
});

/**
 * GET /recipes/:id
 *
 * Display a recipe.
 */
router.get('/:recipe', (req, res, next) => {
	getModel().read(req.params.recipe, (err, entity) => {
		if (err) {
			next(err);
			return;
		}
		res.render('recipes/view.jade', {
			recipe: entity
		});
	});
});

/**
 * GET /recipes/:id/delete
 *
 * Delete a recipe.
 */
router.get('/:recipe/delete', (req, res, next) => {
	getModel().delete (req.params.recipe, (err) => {
		if (err) {
			next(err);
			return;
		}
		res.redirect(req.baseUrl);
	});
});

/**
 * Errors on "/recipes/*" routes.
 */
router.use((err, req, res, next) => {
	// Format error and forward to generic error handler for logging and
	// responding to the request
	err.response = err.message;
	next(err);
});

module.exports = router;

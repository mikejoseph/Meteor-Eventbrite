Package.describe({
  name: 'mikejoseph:eventbrite',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Eventbrite API wrapper',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/mikejoseph/Meteor-Eventbrite',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

// Npm.depends({
// });

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('meteorhacks:async');

  api.addFiles('eventbrite.js', 'server');

  api.export('Eventbrite');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('mikejoseph:eventbrite');
  api.addFiles('eventbrite-tests.js');
});

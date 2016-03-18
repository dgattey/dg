import { Hero } from './hero';
import { List } from 'immutable';
import uuid from 'node-uuid';

export var HEROES = List<Hero>([
  {'id': uuid.v4(), 'name': 'Mr. Nice'},
  {'id': uuid.v4(), 'name': 'Narco'},
  {'id': uuid.v4(), 'name': 'Bombasto'},
  {'id': uuid.v4(), 'name': 'Celeritas'},
  {'id': uuid.v4(), 'name': 'Magneta'},
  {'id': uuid.v4(), 'name': 'RubberMan'},
  {'id': uuid.v4(), 'name': 'Dynama'},
  {'id': uuid.v4(), 'name': 'Dr IQ'},
  {'id': uuid.v4(), 'name': 'Magma'},
  {'id': uuid.v4(), 'name': 'Tornado'}
]);

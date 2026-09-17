import assert from 'node:assert/strict';
import { test } from 'node:test';
import { courseLink } from '../lib/course-content';
test('legacy FDIC description URL becomes actionable without inventing a link',()=>assert.equal(courseLink({description:'https://playmoneysmart.fdic.gov/games'}),'https://playmoneysmart.fdic.gov/games'));
test('ordinary course descriptions remain text',()=>assert.equal(courseLink({description:'Learn budgeting with your mentor.'}),null));
test('description links reject embedded credentials and non-web schemes',()=>{assert.equal(courseLink({description:'https://name:password@example.test'}),null);assert.equal(courseLink({description:'javascript:alert(1)'}),null)});

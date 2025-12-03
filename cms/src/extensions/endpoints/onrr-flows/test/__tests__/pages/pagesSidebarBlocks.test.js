import { jest } from '@jest/globals';
import { getMocks } from '../../__setup__/pages/pagesSidebarBlocks.setup';
import { ApiMessages, CollectionTypes } from '../../../src/constants';

const { runPagesSidebarBlocks: sut } = await import('../../../src/services/pagesFlow/pagesSidebarBlocks');
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // This page is client-side only due to vocabulary repository requirements
  return {
    title: 'Vocabulary Curation'
  };
};

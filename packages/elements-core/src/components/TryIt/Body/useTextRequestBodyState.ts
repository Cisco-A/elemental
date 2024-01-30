import { IMediaTypeContent } from '@stoplight/types';
import * as React from 'react';

import { useGenerateExampleFromMediaTypeContent } from '../../../utils/exampleGeneration/exampleGeneration';
import ExamplesContext from './../../../context/ExamplesContext';
/**
 * Manages the state of the request body text editor.
 *
 * A wrapper for `React.useState`, but handles creating the initial value, and resetting when the content definition changes.
 */

export const useTextRequestBodyState = (
  mediaTypeContent: IMediaTypeContent | undefined,
): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const { globalSelectedExample } = React.useContext(ExamplesContext);

  const selectedExampleIndex = mediaTypeContent?.examples?.findIndex(e => e.key === globalSelectedExample);

  const initialRequestBody = useGenerateExampleFromMediaTypeContent(mediaTypeContent, selectedExampleIndex, {
    skipReadOnly: true,
  });

  const [textRequestBody, setTextRequestBody] = React.useState<string>(initialRequestBody);

  React.useEffect(() => {
    setTextRequestBody(initialRequestBody);
  }, [initialRequestBody]);

  return [textRequestBody, setTextRequestBody];
};

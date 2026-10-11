import { createMetadataKey } from '@angular/forms/signals';

/**
 * Custom metadata: a hint shown next to the field BEFORE the user makes a mistake.
 * Set it in a schema with metadata(path, HINT, () => '...'), read it with field().metadata(HINT)().
 */
export const HINT = createMetadataKey<string>();

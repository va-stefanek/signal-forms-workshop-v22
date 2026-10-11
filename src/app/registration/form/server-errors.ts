import { HttpErrorResponse } from '@angular/common/http';
import { FieldTree, TreeValidationResult, ValidationError } from '@angular/forms/signals';
import { ServerValidationErrors } from '../../api/models';
import { RegistrationForm } from './registration-form.model';

/** Domain paths reported by the API that live under a different name in the form model */
const DOMAIN_TO_FORM_PATH: Record<string, string> = {
  sessionIds: 'agenda',
};

/**
 * Turns an API error into Signal Forms errors.
 * 422 -> one error per reported field, attached to that field.
 * anything else -> one error on the root of the form.
 */
export function serverErrorsToTree(error: unknown, root: FieldTree<RegistrationForm>): TreeValidationResult {
  if (error instanceof HttpErrorResponse && error.status === 422) {
    const body = error.error as ServerValidationErrors;
    return body.errors.map((e): ValidationError.WithOptionalFieldTree => ({
      kind: 'server',
      message: e.message,
      fieldTree: resolvePath(root, DOMAIN_TO_FORM_PATH[e.path] ?? e.path),
    }));
  }
  return { kind: 'serverUnavailable', message: 'Saving failed. Please try again in a moment.' };
}

function resolvePath(root: FieldTree<unknown>, path: string): FieldTree<unknown> {
  let current: any = root;
  for (const key of path.split('.')) {
    if (current?.[key] === undefined) {
      return root;
    }
    current = current[key];
  }
  return current;
}

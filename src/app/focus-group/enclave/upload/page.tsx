import { permanentRedirect } from 'next/navigation'

/**
 * The enclave's prototype uploader is retired in favour of the real one.
 *
 * It PUT raw bytes to an unauthenticated endpoint that wrote them to the
 * server filesystem under a hard-coded mock user id, with no size limit and no
 * type allowlist. It could not have worked in production anyway: a Worker has
 * no writable filesystem.
 *
 * `/focus-group/upload` is the experience that actually works, and has all
 * along: Supabase authentication, Supabase Storage, and a row written against
 * the signed-in participant. The caller is migrated onto it rather than left
 * pointing at endpoints that are about to be deleted.
 */
export default function EnclaveUploadPage() {
  permanentRedirect('/focus-group/upload')
}

import { homeRoute } from '@dg/shared-core/routes/app';
import { redirect } from 'next/navigation';

export default function Unauthorized() {
  redirect(homeRoute);
}

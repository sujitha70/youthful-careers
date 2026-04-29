-- Allow admins to update/delete any job
CREATE POLICY "Admins can update any job"
ON public.jobs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any job"
ON public.jobs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert jobs (employer_id will be admin's own uid)
CREATE POLICY "Admins can create jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view applications for any job (already exists for SELECT all applications)
-- Allow admins to update any application status
CREATE POLICY "Admins can update any application"
ON public.applications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any application"
ON public.applications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
const UserDetails = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <div>Showing user {id}</div>;
};

export default UserDetails;

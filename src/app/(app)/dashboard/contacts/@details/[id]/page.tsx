interface Props {
  params: { id: string };
}

export default function ContactDetails({ params }: Props) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-2">Contact Details</h2>
      <p className="text-gray-400">You selected contact ID: {params.id}</p>
    </div>
  );
}

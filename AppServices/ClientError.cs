namespace AppServices;

#pragma warning disable CA1710 // Identifiers should have correct suffix
public class ClientError : Exception
#pragma warning restore CA1710 // Identifiers should have correct suffix
{
    public ClientError(string message) : base(message) { }
    public ClientError(string message, Exception? ex) : base(message, ex) { }
}

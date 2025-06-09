using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;
using System.Threading.Tasks;
namespace HomeWorth.Server.Models

{
  public class OfferHub : Hub
  {

    private static readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();

    public override async Task OnDisconnectedAsync(Exception exception)
    {
      var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
      if (userId != null && _userConnections.TryGetValue(userId, out var connections))
      {
        connections.Remove(Context.ConnectionId);
        if (connections.Count == 0)
        {
          _userConnections.TryRemove(userId, out _);
        }
      }

      await base.OnDisconnectedAsync(exception);
    }

    public override async Task OnConnectedAsync()
    {
      var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
      if (userId != null)
      {
        _userConnections.AddOrUpdate(
            userId,
            _ => new HashSet<string> { Context.ConnectionId },
            (_, existing) => { existing.Add(Context.ConnectionId); return existing; }
        );
      }

      await base.OnConnectedAsync();
    }
  }
}

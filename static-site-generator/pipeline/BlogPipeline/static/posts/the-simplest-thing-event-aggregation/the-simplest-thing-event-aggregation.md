I have started looking at some of the event aggregation and messaging patterns around MVVM.  [PRISM](https://compositewpf.codeplex.com/) offers an implementation and I have dissected it down to a simplistic implementation in order to learn a bit more.

This is EXPERIMENTAL - the actual implementation has WeakReferences, thread safety etc which are not present here.  However, this is simple and it works (to a degree) and, I think, captures the essence of the PRISM event aggregation code.

## The Aggregator 

```

    public class Aggregator
    {
        private readonly Dictionary<Type, EventBase> _events;

        public Aggregator()
        {
            _events = new Dictionary<Type, EventBase>();
        }

        public TEventType Get<TEventType>() where TEventType : EventBase, new()
        {
            EventBase newEvent = null;

            if (!_events.TryGetValue(typeof(TEventType), out newEvent))
            {
                newEvent = new TEventType();
                _events[typeof(TEventType)] = newEvent;
            }

            return (TEventType)newEvent;
        }
    }

```

## The Event 

```

    public abstract class EventBase
    {
        private readonly List<Action<object>> _subscriptions;

        public EventBase()
        {
            _subscriptions = new List<Action<object>>();
        }

        protected void PublishImpl(object payload)
        {
            foreach (var subscription in _subscriptions)
            {
                subscription(payload);
            }
        }

        protected void SubscribeImpl(Action<object> subscription)
        {
            _subscriptions.Add(subscription);
        }
    }

```

## An Event and Usage 

```

    public class NotificationEvent : EventBase
    {
        public void Publish(string message)
        {
            base.PublishImpl(message);
        }

        public void Subscribe(Action<string> action)
        {
            var subscription = new Action<object>((payload) => action((string)payload));
            base.SubscribeImpl(subscription);
        }
    }

    ...

    _aggregator.Get<NotificationEvent>().Publish("sending a message...");

    _aggregator.Get<NotificationEvent>().Subscribe((message) => { DoSomethingWithTheMessage(message); });

    ...

```


That's it.  My intention is to dissect the GalaSoft MMVM Light Messenger implementation and do a bit of a compare and contrast.  Let's see how I go.


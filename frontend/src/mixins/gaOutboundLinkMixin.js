export const gaOutboundLinkMixin = {
    mounted: function() {
        const links = this.$el.querySelectorAll('a');

        console.log(links);

        if (links.length == 0)
            return;

        const re = /^((http[s]?):\/)?\/?([^:/\s]+)((\/\w+)*\/)([\w\-.]+[^#?\s]+)(.*)?(#[\w-]+)?$/;
        const result = re.exec(window.location.href);

        if (result == null)
            return;

        const hostname = result[3];

        for (var i = 0; i < links.length; i++) {
            var link = links[i];

            if (link.hostname == hostname)
                continue;
            
            const linkResult = re.exec(link.href);

            var eventLabel = '/';

            if (linkResult != null && linkResult.length > 6)
                eventLabel += linkResult[6];

            link.addEventListener('click', () => {
                this.$ga.event({
                    eventCategory: 'Outbound',
                    eventAction: link.hostname,
                    eventLabel: eventLabel
                });
            })
        }
    }
}
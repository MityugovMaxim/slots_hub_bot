const cron = require('node-cron');

exports.schedule = function(time, zone, task)
{
    const job = cron.schedule(
        time,
        () =>
        {
            task();

            job.stop();
        },
        {
            timezone: zone
        }
    );
}

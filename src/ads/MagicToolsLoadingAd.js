import { Link, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useSubscribeDialog } from '../contexts/useSubscribeDialog';

const MagicToolsLoadingAd = () => {
    const { openSubscriptionDialog } = useSubscribeDialog();

    useEffect(() => {
        // Load the adsbygoogle script
        const script = document.createElement("script");
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1307598869123774";
        script.async = true;
        script.crossOrigin = "anonymous";
        document.body.appendChild(script);

        // Initialize the adsbygoogle array if it doesn't exist and push an ad
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
    }, []);

    return (
        <>
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-format="auto"
                data-ad-client="ca-pub-1307598869123774"
                data-ad-slot="9331397200"
                data-full-width-responsive="true"
            />
            <Link onClick={(e) => { e.preventDefault(); openSubscriptionDialog(); }} sx={{ color: theme => theme.palette.success.main, cursor: 'pointer' }} >
                <Typography fontSize={14} textAlign='center' py={4}>
                    Remove ads w/ memeSRC Pro
                </Typography>
            </Link>
        </>
    );
}

export default MagicToolsLoadingAd;

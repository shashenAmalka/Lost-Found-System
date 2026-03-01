/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['@xenova/transformers'],
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Externalize onnxruntime-node so webpack doesn't try to parse .node binaries
            config.externals = config.externals || []
            config.externals.push({
                'onnxruntime-node': 'commonjs onnxruntime-node',
            })
        }
        // Ignore .node binary files
        config.module.rules.push({
            test: /\.node$/,
            use: 'node-loader',
        })
        return config
    },
}

module.exports = nextConfig

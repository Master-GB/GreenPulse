import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, CheckCircle } from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';

interface NFTCertificateImageProps {
  donorName: string;
  projectTitle: string;
  amount: number;
  date: string;
  certificateNumber: string;
  tokenId?: string;
  onCapture?: (uri: string) => void;
}

export const NFTCertificateImage = React.forwardRef<any, NFTCertificateImageProps>(
  ({ donorName, projectTitle, amount, date, certificateNumber, tokenId }, ref) => {
    return (
      <ViewShot ref={ref} options={{ format: 'png', quality: 1.0 }}>
        <View style={styles.container}>
          {/* Background Gradient */}
          <LinearGradient
            colors={['#0a1612', '#122119', '#1a3329']}
            style={styles.gradient}
          >
            {/* Decorative Corner Elements */}
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />

            {/* NFT Badge */}
            {tokenId && (
              <View style={styles.nftBadge}>
                <CheckCircle size={16} color="#1AE57D" />
                <Text style={styles.nftBadgeText}>NFT #{tokenId}</Text>
              </View>
            )}

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Award size={48} color="#1AE57D" />
              </View>
              <Text style={styles.title}>GREENPULSE</Text>
              <Text style={styles.subtitle}>Certificate of Contribution</Text>
              <View style={styles.divider} />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <Text style={styles.label}>This certifies that</Text>
              <View style={styles.nameContainer}>
                <Text style={styles.donorName}>{donorName}</Text>
              </View>

              <Text style={styles.label}>has generously contributed</Text>
              <Text style={styles.amount}>LKR {amount.toLocaleString()}</Text>

              <Text style={styles.label}>to support</Text>
              <View style={styles.projectContainer}>
                <Text style={styles.projectTitle}>{projectTitle}</Text>
              </View>

              <Text style={styles.label}>on</Text>
              <Text style={styles.date}>{date}</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.divider} />
              <Text style={styles.certificateNumber}>Certificate #{certificateNumber}</Text>
              
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>GreenPulse Foundation</Text>
                <Text style={styles.signatureSubtext}>Authorized Signature</Text>
              </View>

              {/* Blockchain Verification */}
              {tokenId && (
                <View style={styles.blockchainBadge}>
                  <Text style={styles.blockchainText}>🔗 Verified on Blockchain</Text>
                  <Text style={styles.blockchainSubtext}>Polygon Network</Text>
                </View>
              )}
            </View>

            {/* Decorative Pattern */}
            <View style={styles.pattern}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={[styles.patternDot, { left: `${i * 20}%` }]} />
              ))}
            </View>
          </LinearGradient>
        </View>
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: 800,
    height: 1000,
  },
  gradient: {
    flex: 1,
    padding: 40,
    position: 'relative',
  },
  
  // Decorative Corners
  cornerTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 60,
    height: 60,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#1AE57D',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 60,
    height: 60,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#1AE57D',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 60,
    height: 60,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#1AE57D',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#1AE57D',
  },

  // NFT Badge
  nftBadge: {
    position: 'absolute',
    top: 30,
    right: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1AE57D20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1AE57D',
  },
  nftBadgeText: {
    color: '#1AE57D',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 40,
  },
  iconContainer: {
    backgroundColor: '#1AE57D20',
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1AE57D',
    letterSpacing: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  divider: {
    width: '60%',
    height: 2,
    backgroundColor: '#1AE57D',
    opacity: 0.5,
  },

  // Content
  content: {
    
    alignItems: 'center',
    marginVertical: 40,
    width: '100%',
  },
  label: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 20,
    marginBottom: 8,
    width: '100%',
    textAlign: 'center',
  },
  nameContainer: {
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  donorName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1AE57D',
    marginBottom: 10,
    textAlign: 'center',
  },
  projectContainer: {
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    width: '100%',
  },
  date: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    width: '100%',
    paddingHorizontal: 40,
  },
  certificateNumber: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 20,
    marginBottom: 30,
    fontFamily: 'monospace',
    textAlign: 'center',
    width: '100%',
  },
  signature: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  signatureLine: {
    width: 200,
    height: 1,
    backgroundColor: '#6b7280',
    marginBottom: 8,
  },
  signatureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  signatureSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  blockchainBadge: {
    backgroundColor: '#1AE57D20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  blockchainText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1AE57D',
    textAlign: 'center',
  },
  blockchainSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },

  // Pattern
  pattern: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  patternDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1AE57D',
    opacity: 0.3,
  },
});

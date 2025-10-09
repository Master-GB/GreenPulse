import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Heart, Send } from 'lucide-react-native';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  onSnapshot, 
  increment, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  DocumentData, 
  QueryDocumentSnapshot, 
  collectionGroup, 
  deleteDoc, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { useAuth } from '../../../contexts/AuthContext';

type Comment = {
  id: string;
  author: string;
  text: string;
  time: string;
  userId: string;
  createdAt: number;
};

export default function StoryDetails() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const id = String(params.id ?? '0');
  const title = String(params.title ?? 'Community Story');
  const image = String(
    params.image ?? 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400'
  );
  const body = String(
    params.body ??
      'This community effort showcases how clean energy transforms daily life — from lighting homes to powering education and healthcare.'
  );

  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState<number>(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  // Format time to relative time (e.g., '2h ago', '1d ago')
  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = Math.floor(seconds / 31536000);
    
    if (interval >= 1) return `${interval}y ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    return 'Just now';
  };

  // Check if user has liked the story
  useEffect(() => {
    if (!user) return;
    
    const checkIfLiked = async () => {
      try {
        const likeDoc = await getDoc(doc(db, 'storyLikes', `${id}_${user.uid}`));
        setLiked(likeDoc.exists());
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    
    checkIfLiked();
  }, [id, user]);

  // Load story data and comments
  useEffect(() => {
    if (!id) return;
    
    const storyRef = doc(db, 'communityStory', id);
    
    // Get story data
    const getStoryData = async () => {
      try {
        const storyDoc = await getDoc(storyRef);
        if (storyDoc.exists()) {
          setLikes(storyDoc.data().likes || 0);
        }
      } catch (error) {
        console.error('Error loading story data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Subscribe to comments
    const commentsCollection = collection(db, 'storyComments');
    const q = query(
      commentsCollection,
      where('storyId', '==', id),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
const commentsData = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          author: data.author,
          text: data.text,
          time: formatTime(data.createdAt),
          userId: data.userId,
          createdAt: data.createdAt
        } as Comment;
      });
      setComments(commentsData);
    });
    
    getStoryData();
    
    return () => unsubscribe();
  }, [id]);

  const onToggleLike = async () => {
    if (!user || !user.uid) {
      Alert.alert('Sign In Required', 'Please sign in to like stories');
      router.push('/signIn');
      return;
    }
    
    try {
      const likeRef = doc(db, 'storyLikes', `${id}_${user.uid}`);
      const storyRef = doc(db, 'communityStory', id);
      
      // Use a batch to ensure both operations succeed or fail together
      const batch = writeBatch(db);
      
      if (liked) {
        // Unlike
        const newLikeCount = Math.max(0, likes - 1);
        batch.update(storyRef, { likes: newLikeCount });
        batch.delete(likeRef);
        
        // Update local state optimistically
        setLikes(newLikeCount);
        setLiked(false);
      } else {
        // Like
        const newLikeCount = likes + 1;
        batch.update(storyRef, { likes: newLikeCount });
        batch.set(likeRef, {
          userId: user.uid,
          storyId: id,
          timestamp: serverTimestamp()
        });
        
        // Update local state optimistically
        setLikes(newLikeCount);
        setLiked(true);
      }
      
      // Commit the batch
      await batch.commit();
      
    } catch (error: any) {
      console.error('Error toggling like:', error);
      
      // Revert optimistic updates on error
      setLiked(prev => !prev);
      setLikes(prev => liked ? prev + 1 : Math.max(0, prev - 1));
      
      if (error.code === 'permission-denied') {
        Alert.alert(
          'Permission Denied', 
          'You do not have permission to perform this action. Please try signing in again.'
        );
      } else {
        Alert.alert(
          'Error', 
          error.message || 'Failed to update like. Please try again.'
        );
      }
    }
  };

  const onAddComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to comment');
      router.push('/signIn');
      return;
    }
    
    try {
      const newComment = {
        storyId: id,
        userId: user.uid,
        author: user.displayName || 'Anonymous',
        text,
        createdAt: Date.now(),
      };
      
      const commentsCollection = collection(db, 'storyComments');
      await addDoc(commentsCollection, newComment);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  const likeColor = liked ? '#1AE57D' : '#9CA3AF';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1 bg-[#122119] justify-between">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <Image source={{ uri: image }} className="w-full h-56" resizeMode="cover" />

          {/* Header */}
          <View className="px-4 py-4">
            <Text className="text-white text-2xl font-bold mb-2">{title}</Text>
            <Text className="text-gray-300 leading-6">{body}</Text>

            {/* Actions */}
            <View className="flex-row items-center mt-4">
              <TouchableOpacity
                onPress={onToggleLike}
                activeOpacity={0.8}
                className="flex-row items-center bg-[#1a2e2e] px-4 py-2 rounded-full"
              >
                <Heart size={18} color={likeColor} fill={liked ? likeColor : 'transparent'} />
                <Text className="text-gray-300 ml-2">{likes} Likes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments */}
          <View className="px-4">
            <Text className="text-white text-xl font-bold mb-3">Comments</Text>

            {loading ? (
              <Text className="text-gray-400 text-center py-4">Loading comments...</Text>
            ) : comments.length === 0 ? (
              <Text className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</Text>
            ) : (
              comments.map((c) => (
                <View key={c.id} className="mb-3">
                  <View className="flex-row items-center mb-1">
                    <View className="w-8 h-8 rounded-full bg-[#1a2e2e] mr-2 items-center justify-center">
                      <Text className="text-[#1AE57D] font-bold">{c.author.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text className="text-gray-300 font-semibold mr-2">
                      {c.userId === user?.uid ? 'You' : c.author}
                    </Text>
                    <Text className="text-gray-500 text-xs">{c.time}</Text>
                  </View>
                  <Text className="text-gray-300 leading-5 ml-10">{c.text}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Composer */}
        <View className="px-4  pb-5 pt-3 bg-[#122119] border-t border-gray-800" style={{ paddingBottom: Platform.OS === 'ios' ? 25 : 5 }}>
          <View className="flex-row items-center bg-[#1a2e2e] rounded-full px-3 py-2 mb-1">
            <TextInput
              placeholder={user ? 'Add a comment...' : 'Sign in to comment'}
              placeholderTextColor="#6B7280"
              className="flex-1 text-gray-200 px-2"
              value={commentText}
              onChangeText={(text) => setCommentText(text)}
              multiline
              editable={!!user}
              onFocus={() => !user && router.push('/signIn')}
            />
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={onAddComment} 
              className="ml-2"
              disabled={!user || !commentText.trim()}
            >
              <Send size={20} color={user && commentText.trim() ? "#1AE57D" : "#6B7280"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
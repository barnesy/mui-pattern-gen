import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  IconButton,
  Stack,
  Chip,
  Divider,
  Link,
  useTheme
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

export interface UserProfileCardProps {
  variant?: 'default' | 'compact' | 'detailed';
  name?: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  email?: string;
  skills?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  showEmail?: boolean;
  showLocation?: boolean;
  showSkills?: boolean;
  elevation?: number;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  variant = 'default',
  name = 'John Doe',
  role = 'Senior Developer',
  bio = 'Passionate about creating beautiful and functional user interfaces. Love working with React and modern web technologies.',
  avatarUrl = '',
  location = 'San Francisco, CA',
  email = 'john.doe@example.com',
  skills = ['React', 'TypeScript', 'Material-UI', 'Node.js'],
  socialLinks = {
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    website: 'https://example.com'
  },
  showEmail = true,
  showLocation = true,
  showSkills = true,
  elevation = 1
}) => {
  const theme = useTheme();

  const renderSocialIcon = (platform: keyof typeof socialLinks, Icon: React.ElementType) => {
    const link = socialLinks[platform];
    if (!link) return null;

    return (
      <IconButton
        component={Link}
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        sx={{
          color: theme.palette.text.secondary,
          '&:hover': {
            color: theme.palette.primary.main,
          }
        }}
      >
        <Icon fontSize="small" />
      </IconButton>
    );
  };

  if (variant === 'compact') {
    return (
      <Card elevation={elevation}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={avatarUrl}
              alt={name}
              sx={{ width: 56, height: 56 }}
            >
              {name.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" component="div" gutterBottom>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {role}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              {renderSocialIcon('twitter', TwitterIcon)}
              {renderSocialIcon('linkedin', LinkedInIcon)}
              {renderSocialIcon('github', GitHubIcon)}
              {renderSocialIcon('website', WebsiteIcon)}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={elevation}>
      <CardContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          mb={2}
        >
          <Avatar
            src={avatarUrl}
            alt={name}
            sx={{
              width: variant === 'detailed' ? 120 : 80,
              height: variant === 'detailed' ? 120 : 80,
              mb: 2,
              border: `3px solid ${theme.palette.divider}`
            }}
          >
            {name.charAt(0)}
          </Avatar>
          
          <Typography variant="h5" component="div" gutterBottom>
            {name}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {role}
          </Typography>

          {variant === 'detailed' && bio && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, mb: 2, px: 2 }}
            >
              {bio}
            </Typography>
          )}
        </Box>

        {(showLocation || showEmail) && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1} mb={2}>
              {showLocation && location && (
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {location}
                  </Typography>
                </Box>
              )}
              {showEmail && email && (
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    component={Link}
                    href={`mailto:${email}`}
                    sx={{
                      color: theme.palette.text.secondary,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {email}
                  </Typography>
                </Box>
              )}
            </Stack>
          </>
        )}

        {showSkills && skills.length > 0 && variant !== 'compact' && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Skills
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
        >
          {renderSocialIcon('twitter', TwitterIcon)}
          {renderSocialIcon('linkedin', LinkedInIcon)}
          {renderSocialIcon('github', GitHubIcon)}
          {renderSocialIcon('website', WebsiteIcon)}
        </Stack>
      </CardContent>
    </Card>
  );
};
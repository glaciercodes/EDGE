// DOM Elements
const generateNowBtn = document.getElementById('generateNowBtn');
const generateArticleBtn = document.getElementById('generateArticleBtn');
const copyArticleBtn = document.getElementById('copyArticleBtn');
const shareArticleBtn = document.getElementById('shareArticleBtn');
const rateUsBtn = document.getElementById('rateUsBtn');
const resultSection = document.getElementById('resultSection');
const articleOutput = document.getElementById('articleOutput');

// Scroll to generator section when "Generate Now" is clicked
generateNowBtn.addEventListener('click', () => {
    document.querySelector('.generator-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
});

// Generate article when form is submitted
generateArticleBtn.addEventListener('click', async () => {
    const topic = document.getElementById('topic').value.trim();
    const title = document.getElementById('title').value.trim();
    const wordCount = document.getElementById('wordCount').value;
    
    if (!topic) {
        alert('Please enter a topic or keyword');
        return;
    }
    
    // Show loading state
    generateArticleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateArticleBtn.disabled = true;
    
    try {
        // Call the API to generate article
        const response = await fetch('/api/detect.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic,
                title,
                wordCount
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate article');
        }
        
        const data = await response.json();
        
        // Display the generated article
        articleOutput.innerHTML = formatArticle(data.article);
        resultSection.style.display = 'block';
        
        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error generating article:', error);
        alert('Sorry, there was an error generating your article. Please try again.');
        
        // For demo purposes, show a sample article if API fails
        articleOutput.innerHTML = formatArticle(generateSampleArticle(topic, title, wordCount));
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    } finally {
        // Reset button state
        generateArticleBtn.innerHTML = 'Generate Article';
        generateArticleBtn.disabled = false;
    }
});

// Copy article to clipboard
copyArticleBtn.addEventListener('click', () => {
    const articleText = articleOutput.innerText;
    
    navigator.clipboard.writeText(articleText)
        .then(() => {
            // Show success feedback
            const originalText = copyArticleBtn.textContent;
            copyArticleBtn.textContent = 'Copied!';
            copyArticleBtn.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                copyArticleBtn.textContent = originalText;
                copyArticleBtn.style.backgroundColor = '';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy article to clipboard');
        });
});

// Share tool
shareArticleBtn.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'GenZbot - AI Article Generator',
            text: 'Check out this amazing AI tool that generates high-quality articles in seconds!',
            url: window.location.href,
        })
        .catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                alert('Link copied to clipboard! Share it with your friends.');
            })
            .catch(err => {
                console.error('Failed to copy link: ', err);
                alert('Please copy the URL manually: ' + window.location.href);
            });
    }
});

// Rate Us button
rateUsBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Format article with proper paragraphs and styling
function formatArticle(articleText) {
    // Split into paragraphs and wrap each in <p> tags
    const paragraphs = articleText.split('\n\n');
    return paragraphs.map(p => `<p>${p}</p>`).join('');
}

// Generate a sample article for demo purposes (when API is not available)
function generateSampleArticle(topic, title, wordCount) {
    const sampleArticles = {
        300: `# ${title || `Understanding ${topic}`}

In today's fast-paced digital landscape, ${topic} has emerged as a critical component of success. This innovative approach transforms how we think about traditional methods, offering new perspectives and solutions.

The core principles of ${topic} focus on efficiency, adaptability, and user-centric design. By embracing these concepts, organizations can achieve remarkable results while minimizing resource expenditure. The methodology combines proven strategies with cutting-edge innovations.

As we look to the future, the potential applications of ${topic} continue to expand across various industries. Early adopters are already seeing significant advantages, positioning themselves as leaders in their respective fields. The journey begins with understanding these fundamental concepts.`,

        500: `# ${title || `The Complete Guide to ${topic}`}

## Introduction to ${topic}

${topic} represents a paradigm shift in how we approach problem-solving in the modern era. This comprehensive methodology has gained significant traction across multiple sectors, from technology to education, and for good reason. The approach combines time-tested principles with contemporary innovations to deliver exceptional outcomes.

## Key Benefits and Advantages

One of the most compelling aspects of ${topic} is its versatility. Whether applied in corporate environments or individual projects, the methodology demonstrates consistent effectiveness. Research indicates that organizations implementing ${topic} strategies experience an average efficiency improvement of 40-60%.

The scalability of ${topic} makes it particularly valuable for growing businesses. Unlike rigid systems that struggle with expansion, this approach naturally adapts to increasing complexity and scope. This flexibility ensures long-term viability and continuous improvement.

## Practical Implementation

Implementing ${topic} requires careful planning and strategic execution. Begin by assessing current processes and identifying areas with the greatest potential for improvement. The transition should be gradual, allowing team members to adapt to new methodologies while maintaining productivity.

Successful implementation typically involves three key phases: assessment, integration, and optimization. Each phase builds upon the previous, creating a solid foundation for sustainable growth and development. Regular evaluation ensures the approach remains aligned with organizational goals.

## Future Outlook

As technology continues to evolve, the applications of ${topic} will undoubtedly expand. Early indicators suggest significant potential in emerging fields like artificial intelligence and sustainable development. Staying informed about these developments positions organizations to capitalize on new opportunities.`,

        700: `# ${title || `Mastering ${topic}: Strategies for Success in the Digital Age`}

## The Evolution of ${topic}

The concept of ${topic} has undergone significant transformation over the past decade. What began as a niche methodology has evolved into a comprehensive framework embraced by industry leaders worldwide. This evolution reflects broader changes in how we approach complex challenges in an increasingly interconnected world.

Understanding the historical context of ${topic} provides valuable insights into its current applications and future potential. The methodology's roots can be traced to several pioneering thinkers who recognized the limitations of traditional approaches and sought more dynamic solutions.

## Core Principles and Methodologies

At its foundation, ${topic} operates on several key principles that distinguish it from conventional methods. These include adaptive planning, continuous improvement, and user-centered design. Each principle contributes to the overall effectiveness of the approach while maintaining flexibility for specific applications.

The methodology incorporates both qualitative and quantitative assessment tools, providing comprehensive insights into performance and outcomes. This balanced approach ensures decisions are data-driven while accounting for human factors and contextual variables that pure metrics might miss.

## Real-World Applications and Case Studies

Numerous organizations have successfully implemented ${topic} strategies with remarkable results. A prominent technology company reported a 67% increase in project completion rates after adopting these methodologies. Similarly, educational institutions have seen significant improvements in student engagement and outcomes.

The healthcare sector has particularly benefited from ${topic} approaches, with hospitals reporting enhanced patient care and operational efficiency. These success stories demonstrate the methodology's versatility across diverse environments and challenges.

## Implementation Framework

Successfully integrating ${topic} requires a structured yet flexible approach. The process typically begins with comprehensive assessment and planning, followed by phased implementation and continuous evaluation. Key stakeholders should be involved throughout to ensure alignment with organizational objectives.

Training and development play crucial roles in successful adoption. Team members need understanding not just of the procedures but of the underlying principles that make ${topic} effective. This deeper comprehension enables more innovative applications and problem-solving.

## Challenges and Solutions

Like any significant organizational change, implementing ${topic} presents certain challenges. Resistance to change, resource constraints, and measurement difficulties are common obstacles. However, proven strategies exist to address each of these concerns effectively.

Clear communication, demonstrated quick wins, and strong leadership support typically overcome initial resistance. Meanwhile, phased implementation helps manage resource allocation while building momentum through visible successes.

## The Future Landscape

Looking ahead, ${topic} is poised to become even more influential as digital transformation accelerates. Emerging technologies like artificial intelligence and blockchain present new opportunities to enhance and expand these methodologies. Forward-thinking organizations are already exploring these possibilities.

The ongoing globalization of markets and remote work trends further increase the relevance of ${topic}. Its emphasis on adaptability and efficiency aligns perfectly with the demands of our evolving economic landscape.`,

        1000: `# ${title || `The Comprehensive Guide to Excelling with ${topic}`}

## Introduction: Understanding the ${topic} Revolution

In an era defined by rapid technological advancement and shifting market dynamics, ${topic} has emerged as a critical differentiator between organizations that thrive and those that struggle to adapt. This comprehensive approach represents more than just a methodology—it's a fundamental shift in how we conceptualize and execute strategies in complex environments.

The significance of ${topic} extends beyond immediate operational improvements. It fosters a culture of innovation, collaboration, and continuous learning that positions organizations for long-term success in an unpredictable business landscape. This guide explores the multifaceted nature of ${topic} and provides actionable insights for implementation.

## Historical Context and Evolution

To fully appreciate the power of ${topic}, it's essential to understand its origins and development. The methodology emerged from the convergence of several disciplines, drawing insights from systems theory, behavioral psychology, and management science. Early pioneers recognized that traditional linear approaches were increasingly inadequate for addressing modern challenges.

The digital revolution of the early 21st century accelerated the adoption and refinement of ${topic} principles. As organizations grappled with unprecedented rates of change, the flexibility and responsiveness inherent in this approach proved particularly valuable. Today, it represents a synthesis of decades of research and practical application.

## Fundamental Principles

${topic} is built upon several core principles that guide its application across diverse contexts:

### Adaptive Planning
Unlike rigid long-term plans, ${topic} emphasizes dynamic planning processes that respond to changing conditions. This doesn't mean abandoning strategy, but rather developing more responsive and iterative approaches to execution.

### User-Centered Design
Placing the end-user at the center of all decisions ensures solutions remain relevant and effective. This principle extends beyond product development to influence organizational structures and processes.

### Continuous Improvement
The methodology incorporates mechanisms for ongoing assessment and refinement. This creates a virtuous cycle where each iteration builds upon previous learning and experience.

### Collaborative Integration
${topic} breaks down traditional silos, fostering cross-functional collaboration and knowledge sharing. This integrated approach generates solutions that are more comprehensive and innovative.

## Implementation Strategies

Successfully adopting ${topic} requires careful planning and execution. The following framework provides a structured approach to implementation:

### Assessment Phase
Begin with a comprehensive evaluation of current processes, capabilities, and challenges. This diagnostic phase should identify both strengths to build upon and gaps to address.

### Strategic Alignment
Ensure ${topic} implementation aligns with broader organizational goals and values. This alignment creates coherence and maximizes impact across the organization.

### Phased Rollout
Implement ${topic} incrementally, starting with pilot projects or specific departments. This controlled approach allows for learning and adjustment before full-scale deployment.

### Capability Development
Invest in training and development to build the necessary skills and mindsets. This includes both technical competencies and the cultural shifts required for success.

### Measurement and Evaluation
Establish clear metrics to track progress and impact. These should balance quantitative indicators with qualitative assessments of cultural and behavioral changes.

## Case Studies: Success Stories Across Industries

The versatility of ${topic} is demonstrated by its successful application across diverse sectors:

### Technology Sector
A leading software company implemented ${topic} methodologies across its development teams, resulting in a 45% reduction in time-to-market and a 30% improvement in product quality metrics. The approach enabled more responsive adaptation to user feedback and market changes.

### Healthcare Applications
A hospital network adopted ${topic} principles to redesign patient care processes. The results included a 25% improvement in patient satisfaction scores and a 15% reduction in operational costs. The methodology facilitated better coordination between departments and more personalized patient experiences.

### Educational Transformation
A university integrated ${topic} into its administrative and teaching practices, leading to significant improvements in student retention and engagement. Faculty reported greater satisfaction with their ability to adapt to diverse learning needs and styles.

## Overcoming Common Challenges

Implementing any significant organizational change presents challenges. Common obstacles with ${topic} adoption include:

### Resistance to Change
Address this through clear communication of benefits, involvement of stakeholders in planning, and demonstrating early wins that build momentum.

### Resource Constraints
Phased implementation helps manage resource demands while building capability gradually. Look for opportunities to reallocate existing resources rather than always requiring new investments.

### Measurement Difficulties
Develop a balanced scorecard that includes both quantitative metrics and qualitative indicators. Regular feedback loops help refine measurement approaches over time.

### Sustainability Concerns
Embed ${topic} principles into existing structures and processes rather than treating them as separate initiatives. This integration promotes long-term sustainability.

## Future Directions and Emerging Trends

As we look to the future, several trends are likely to shape the evolution of ${topic}:

### Integration with Artificial Intelligence
AI technologies offer powerful tools to enhance ${topic} methodologies, particularly in areas of data analysis, pattern recognition, and predictive modeling.

### Globalization and Remote Work
The increasing prevalence of distributed teams makes the collaborative and communication aspects of ${topic} even more valuable. The methodology provides frameworks for effective coordination across geographic and cultural boundaries.

### Sustainability Focus
There is growing emphasis on how ${topic} can contribute to environmental and social sustainability goals. The methodology's adaptive nature makes it well-suited to addressing complex sustainability challenges.

### Personalization at Scale
Advances in technology are enabling more personalized applications of ${topic} principles at larger scales, creating new opportunities for customization and precision.

## Conclusion: Embracing the ${topic} Mindset

Ultimately, ${topic} represents more than a set of techniques—it's a mindset that embraces complexity, values adaptation, and seeks continuous improvement. Organizations that successfully cultivate this mindset position themselves to thrive in an increasingly volatile and uncertain world.

The journey toward mastering ${topic} requires commitment, patience, and willingness to learn from both successes and failures. However, the rewards—increased resilience, innovation, and effectiveness—make this investment worthwhile. As the business landscape continues to evolve, the principles of ${topic} provide a stable foundation for navigating change and seizing opportunities.`
    };
    
    return sampleArticles[wordCount] || sampleArticles[500];
}

// Add some interactive effects to elements
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.review-card, .tool-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Add animation to stars in rating
    const stars = document.querySelectorAll('.rating .stars i');
    stars.forEach((star, index) => {
        star.style.animationDelay = `${index * 0.1}s`;
        star.classList.add('pulse');
    });
});

// Add CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .pulse {
        animation: pulse 2s infinite;
    }
`;
document.head.appendChild(style);

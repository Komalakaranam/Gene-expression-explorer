from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

class BioGeneAssistant:
    def __init__(self):
        # Initialize the model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained("microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext")
        self.model = AutoModelForCausalLM.from_pretrained("microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext")
        
        # Move model to GPU if available
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)

    def get_response(self, user_input):
        try:
            # Tokenize input
            inputs = self.tokenizer(user_input, return_tensors="pt").to(self.device)
            
            # Generate response
            outputs = self.model.generate(
                inputs["input_ids"],
                max_length=150,
                num_return_sequences=1,
                temperature=0.7,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            # Decode response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return response
        except Exception as e:
            return f"I apologize, but I encountered an error: {str(e)}"

# Initialize the assistant
assistant = BioGeneAssistant()
